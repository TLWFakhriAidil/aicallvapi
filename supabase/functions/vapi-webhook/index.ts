import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('VAPI WEBHOOK RECEIVED:', JSON.stringify(payload, null, 2))

    const messageType = payload.message?.type
    const messageData = payload.message

    if (!messageType || !messageData) {
      console.log('Invalid webhook format')
      return new Response(
        JSON.stringify({ status: 'ignored', reason: 'Invalid format' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    switch (messageType) {
      case 'tool-calls':
      case 'function-call':
        return await processFunctionCall(supabase, messageData)

      case 'end-of-call-report':
        return await processEndOfCallReport(supabase, messageData)

      default:
        console.log(`Webhook type '${messageType}' received but ignored`)
        return new Response(
          JSON.stringify({ status: 'ignored' }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(
      JSON.stringify({ status: 'error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})

async function processFunctionCall(supabase: any, messageData: any) {
  console.log('FUNCTION CALL RECEIVED:', messageData)
  
  try {
    const functionCalls = messageData.toolCalls || messageData.tool_calls || (messageData.functionCall ? [messageData.functionCall] : [])
    const results = []

    for (const functionCall of functionCalls) {
      const functionName = functionCall.function?.name || functionCall.name
      const functionArgs = functionCall.function?.arguments || functionCall.arguments || {}

      console.log('PROCESSING FUNCTION CALL:', {
        function_name: functionName,
        arguments: functionArgs
      })

      switch (functionName) {
        case 'send_whatsapp_tool':
          console.log('🚀 SEND_WHATSAPP_TOOL TRIGGERED!', {
            phone_number: functionArgs.phoneNumber || 'NOT PROVIDED',
            message_type: functionArgs.messageType || 'NOT PROVIDED',
            timestamp: new Date().toISOString()
          })
          
          const whatsappResult = await handleWhatsAppTool(functionArgs)
          results.push({
            tool: 'send_whatsapp_tool',
            result: whatsappResult
          })
          break

        case 'end_call_tool':
          console.log('📞 END_CALL_TOOL TRIGGERED!', {
            arguments: functionArgs,
            timestamp: new Date().toISOString()
          })
          
          results.push({
            tool: 'end_call_tool',
            result: { success: true, message: 'Call ended' }
          })
          break

        default:
          console.log('⚠️ UNKNOWN FUNCTION CALL:', {
            function_name: functionName,
            arguments: functionArgs
          })
          
          results.push({
            tool: functionName,
            result: { error: 'Unknown function' }
          })
      }
    }

    console.log('FUNCTION CALL PROCESSING COMPLETED:', {
      total_calls: functionCalls.length,
      results: results
    })

    return new Response(
      JSON.stringify({
        status: 'success',
        processed_calls: functionCalls.length,
        results: results
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('FUNCTION CALL PROCESSING ERROR:', error)
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
}

async function handleWhatsAppTool(args: any) {
  try {
    const phoneNumber = args.phoneNumber
    const messageType = args.messageType || 'testimonial_package'
    
    console.log('📱 HANDLING WHATSAPP TOOL:', {
      phone: phoneNumber,
      message_type: messageType,
      raw_args: args
    })

    if (!phoneNumber) {
      console.error('❌ WHATSAPP TOOL: Missing phone number')
      return {
        success: false,
        error: 'Phone number is required'
      }
    }

    // Here you would integrate with your WhatsApp API
    // For now, just log and return success
    console.log('✅ WHATSAPP TOOL RESULT:', {
      phone: phoneNumber,
      message_type: messageType,
      status: 'simulated_success'
    })

    return {
      success: true,
      message: 'WhatsApp processing completed',
      phone_number: phoneNumber,
      message_type: messageType
    }

  } catch (error) {
    console.error('❌ WHATSAPP TOOL ERROR:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function processEndOfCallReport(supabase: any, message: any) {
  // Get phone number from call data
  const phoneNumber = message.call?.customer?.number || 
                     message.customer?.number ||
                     message.call?.metadata?.customer_phone ||
                     message.metadata?.customer_phone

  if (!phoneNumber) {
    console.error('END OF CALL: Missing customer phone number')
    return new Response(
      JSON.stringify({ status: 'error', message: 'Missing customer_phone' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  try {
    // Get campaign ID from call metadata if available
    const campaignId = message.call?.metadata?.campaign_id || 
                      message.metadata?.campaign_id ||
                      null

    // Extract structured data from analysis
    const structuredData = message.analysis?.structuredData || {}
    const stageReached = structuredData.stage_reached || 'Unknown'
    const isClosed = (structuredData.is_closed || 'No') === 'Yes'
    const reasonNotClosed = structuredData.reason_not_closed || null
    const evaluationStatus = isClosed ? 'Success' : 'Fail'

    // Get VAPI call ID
    const vapiCallId = message.call?.id || message.id

    // Convert duration to integer (round to nearest second)
    const durationSeconds = message.durationSeconds ? Math.round(parseFloat(message.durationSeconds)) : 0

    // Determine user_id for call log
    let userId: string | null = null;
    try {
      if (campaignId) {
        const { data: campaignRow, error: campaignErr } = await supabase
          .from('campaigns')
          .select('user_id')
          .eq('id', campaignId)
          .maybeSingle();
        if (campaignErr) {
          console.error('Error fetching campaign user_id:', campaignErr);
        }
        if (campaignRow?.user_id) {
          userId = campaignRow.user_id;
        }
      }
      if (!userId && phoneNumber) {
        const { data: numberRow, error: numberErr } = await supabase
          .from('numbers')
          .select('user_id')
          .eq('phone_number', phoneNumber)
          .maybeSingle();
        if (numberErr) {
          console.error('Error fetching numbers user_id:', numberErr);
        }
        if (numberRow?.user_id) {
          userId = numberRow.user_id;
        }
      }
      if (!userId) {
        const assistantId = message.call?.assistantId || null;
        if (assistantId) {
          const { data: apiRow, error: apiErr } = await supabase
            .from('api_keys')
            .select('user_id')
            .eq('assistant_id', assistantId)
            .maybeSingle();
          if (apiErr) {
            console.error('Error fetching api_keys user_id:', apiErr);
          }
          if (apiRow?.user_id) {
            userId = apiRow.user_id;
          }
        }
      }
    } catch (uidErr) {
      console.error('Error resolving user_id for call log:', uidErr);
    }

    if (!userId) {
      console.error('END OF CALL: Could not resolve user_id; skipping insert');
      return new Response(
        JSON.stringify({ status: 'error', message: 'Could not resolve user_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Insert call log record
    const { data: callLog, error } = await supabase
      .from('call_logs')
      .insert({
        user_id: userId,
        campaign_id: campaignId,
        call_id: vapiCallId || `vapi_${Date.now()}`,
        agent_id: message.call?.assistantId || 'unknown',
        caller_number: phoneNumber,
        phone_number: phoneNumber,
        vapi_call_id: vapiCallId,
        start_time: message.call?.createdAt || new Date().toISOString(),
        duration: durationSeconds,
        status: evaluationStatus.toLowerCase(),
        end_of_call_report: message,
        metadata: {
          structured_data: structuredData,
          stage_reached: stageReached,
          is_closed: isClosed,
          reason_not_closed: reasonNotClosed,
          evaluation_status: evaluationStatus,
          call_cost: message.cost || 0,
          recording_url: message.recordingUrl,
          transcript: message.transcript,
          summary: message.summary,
          call_status: message.endedReason || 'unknown'
        }
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw error
    }

    // Update campaign statistics if campaign_id exists
    if (campaignId) {
      if (evaluationStatus === 'Success') {
        await supabase.rpc('increment_campaign_success', { campaign_id: campaignId })
      } else {
        await supabase.rpc('increment_campaign_failed', { campaign_id: campaignId })
      }
    }

    console.log('END OF CALL: Record inserted successfully', {
      phone: phoneNumber,
      record_id: callLog.id,
      is_closed: isClosed,
      stage: stageReached,
      campaign_id: campaignId
    })

    return new Response(
      JSON.stringify({ 
        status: 'success', 
        record_id: callLog.id,
        evaluation_status: evaluationStatus
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('Failed to process end-of-call:', error)
    return new Response(
      JSON.stringify({ status: 'error', message: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
}