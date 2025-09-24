import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from custom auth session token
    const sessionToken = authHeader.replace('Bearer ', '');
    
    // Look up session in user_sessions table
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('session_token', sessionToken)
      .single();
    
    if (sessionError || !sessionData) {
      throw new Error('Invalid session token');
    }
    
    // Check if session has expired
    if (new Date(sessionData.expires_at) < new Date()) {
      throw new Error('Session expired');
    }
    
    // Get user from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, username')
      .eq('id', sessionData.user_id)
      .single();
    
    if (userError || !userData) {
      throw new Error('User not found');
    }
    
    const user = { id: userData.id, username: userData.username };

    const { campaignName, promptId, phoneNumbers, concurrentLimit = 10 } = await req.json();

    console.log(`Starting batch call campaign: ${campaignName} for user: ${user.id}`);

    // Validate inputs
    if (!campaignName || !promptId || !phoneNumbers || !Array.isArray(phoneNumbers)) {
      throw new Error('Missing required parameters: campaignName, promptId, phoneNumbers');
    }

    // Get user's API keys
    const { data: apiKeys, error: apiError } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (apiError || !apiKeys || !apiKeys.vapi_api_key) {
      throw new Error('VAPI API key not found. Please configure your API keys first.');
    }

    // Get the selected prompt
    const { data: prompt, error: promptError } = await supabaseAdmin
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single();

    if (promptError || !prompt) {
      throw new Error('Prompt not found');
    }

    // Validate and format phone numbers
    const validPhones: string[] = [];
    const invalidPhones: string[] = [];

    for (const phone of phoneNumbers) {
      const cleanPhone = phone.replace(/[^0-9+]/g, '').trim();
      
      if (!cleanPhone) {
        invalidPhones.push(phone);
        continue;
      }

      // Format to E164
      let formattedPhone: string;
      if (cleanPhone.startsWith('+')) {
        formattedPhone = cleanPhone;
      } else if (cleanPhone.startsWith('60')) {
        formattedPhone = '+' + cleanPhone;
      } else if (cleanPhone.startsWith('0')) {
        formattedPhone = '+6' + cleanPhone;
      } else {
        formattedPhone = '+60' + cleanPhone;
      }

      if (formattedPhone.length >= 12 && formattedPhone.length <= 15) {
        validPhones.push(formattedPhone);
      } else {
        invalidPhones.push(phone);
      }
    }

    if (validPhones.length === 0) {
      throw new Error('No valid phone numbers provided');
    }

    // Create campaign record
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .insert({
        user_id: user.id,
        campaign_name: campaignName,
        prompt_id: promptId,
        status: 'in_progress',
        total_numbers: validPhones.length
      })
      .select()
      .single();

    if (campaignError) {
      throw new Error('Failed to create campaign: ' + campaignError.message);
    }

    console.log(`Created campaign ${campaign.id} with ${validPhones.length} valid numbers`);

    // Full assistant configuration (from your PHP code)
    const assistantConfig = {
      name: 'AI Batch Call Agent',
      model: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.6
      },
      voice: {
        provider: '11labs',
        voiceId: 'Kci88S94DOa31YrdXiWR',
        model: 'eleven_flash_v2_5',
        stability: 0.8,
        similarityBoost: 1,
        style: 0.0,
        useSpeakerBoost: false,
        speed: 0.8,
        optimizeStreamingLatency: 4,
        autoMode: true,
        inputPunctuationBoundaries: [",", "،", "۔", "，", "."]
      },
      firstMessage: prompt.first_message,
      firstMessageMode: 'assistant-speaks-first',
      endCallMessage: 'Okay , terima kasih dan selamat sejahtera',
      voicemailMessage: 'RVSB',
      hipaaEnabled: false,
      clientMessages: [
        'function-call',
        'hang', 
        'tool-calls',
        'tool-calls-result',
        'tool.completed',
        'function-call-result'
      ],
      serverMessages: [
        'end-of-call-report',
        'hang',
        'function-call',
        'tool-calls'
      ],
      server: {
        url: 'https://erpsistemsolutions.com/saveRecording',
        timeoutSeconds: 20
      },
      transcriber: {
        provider: 'azure',
        language: 'ms-MY',
        segmentationStrategy: 'Semantic',
        segmentationMaximumTimeMs: 20000,
        segmentationSilenceTimeoutMs: 100
      },
      startSpeakingPlan: {
        smartEndpointingPlan: {
          provider: 'vapi'
        }
      },
      voicemailDetection: {
        provider: 'vapi',
        backoffPlan: {
          maxRetries: 6,
          startAtSeconds: 5,
          frequencySeconds: 5
        },
        beepMaxAwaitSeconds: 0
      },
      artifactPlan: {
        recordingFormat: 'mp3'
      },
      backgroundSound: 'off',
      backgroundDenoisingEnabled: true,
      silenceTimeoutSeconds: 30,
      responseDelaySeconds: 0.4,
      interruptionsEnabled: false,
      llmRequestDelaySeconds: 0.1,
      numWordsToInterruptAssistant: 2,
      maxDurationSeconds: 600,
      backchannelingEnabled: false,
      modelOutputInMessagesEnabled: true,
      transportConfigurations: [
        {
          provider: 'twilio',
          timeout: 60,
          record: true,
          recordingChannels: 'dual'
        }
      ]
    };

    // Phone configuration
    const phoneConfig = {
      twilioPhoneNumber: '+17755242070', // Replace with actual Twilio number
      twilioAccountSid: 'ACb04524fa234bd27d7ee7be008cf4be5d', // Replace with actual SID
      twilioAuthToken: 'c9dce4c53f6b38b1c1a0b810dc5a3835', // Replace with actual token
    };

    // Process calls in chunks
    const chunks = [];
    for (let i = 0; i < validPhones.length; i += concurrentLimit) {
      chunks.push(validPhones.slice(i, i + concurrentLimit));
    }

    let successCount = 0;
    let failureCount = 0;

    for (const [chunkIndex, chunk] of chunks.entries()) {
      console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} calls`);

      // Create promises for concurrent calls
      const callPromises = chunk.map(async (phoneNumber) => {
        try {
          // Replace placeholder in system prompt
          const callSystemPrompt = prompt.system_prompt.replace('{{CUSTOMER_PHONE_NUMBER}}', phoneNumber);

          // Complete assistant configuration with tools and analysis
          const fullAssistantConfig = {
            ...assistantConfig,
            model: {
              ...assistantConfig.model,
              systemPrompt: callSystemPrompt,
              tools: [
                {
                  type: 'function',
                  function: {
                    name: 'send_whatsapp_tool',
                    description: 'Hantar mesej WhatsApp semasa panggilan',
                    parameters: {
                      type: 'object',
                      properties: {
                        phoneNumber: { type: 'string', description: 'Nombor telefon pelanggan (E164)' },
                        messageType: {
                          type: 'string',
                          description: 'Jenis mesej',
                          enum: ['order_confirmation', 'info_product']
                        },
                        customerName: { type: 'string', description: 'Nama penuh pelanggan untuk pengesahan pesanan.' },
                        customerAddress: { type: 'string', description: 'Alamat penuh pelanggan untuk pengesahan pesanan.' }
                      },
                      required: ['phoneNumber', 'messageType']
                    },
                  },
                },
                {
                  type: 'endCall',
                  function: {
                    name: 'end_call_tool',
                    description: 'End the phone call.',
                    parameters: { type: 'object', properties: {} },
                  },
                },
              ]
            },
            analysisPlan: {
              successEvaluationPrompt: 'Did the customer show interest or agree to purchase? Return TRUE if interested/purchased. Return FALSE if rejected.',
              successEvaluationRubric: 'PassFail',
              structuredDataPlan: {
                enabled: true,
                messages: [
                  {
                    role: 'system',
                    content: `Anda adalah seorang penganalisis panggilan jualan yang sangat teliti untuk produk Heij-Q VTEC. Berdasarkan transkrip panggilan dan skrip asal (CALL FLOW), sila analisis dan pulangkan data dalam format JSON.

**SKRIP ASAL (CALL FLOW) UNTUK RUJUKAN:**
- **Introduction**: (Langkah 1-4) Pembukaan, minta izin, kenal pasti isu (masalah kesihatan), dan untuk siapa produk dicari (target).
- **Fact Finding Masalah**: (Langkah 5-6) Tanya detail masalah dan buat pelanggan rasa kepentingan untuk selesaikan masalah (empathetic agitate).
- **Present Produk**: (Langkah 7-9) Perkenalkan VTEC, terangkan kandungan & manfaat (termasuk hantar WhatsApp testimoni), dan tanya minat (soft close).
- **Harga**: (Langkah 10-12) Atasi bantahan (objection handling) dan tawarkan pakej harga (RM130, RM100, RM60) serta ingatkan tentang cabutan bertuah.
- **Confirmation Order**: (Langkah 13) Minta nama penuh dan alamat penuh selepas pelanggan bersetuju untuk membeli.

Json Schema: {{schema}}
Only respond with the JSON.`
                  },
                  {
                    role: 'user',
                    content: 'Here is the transcript: {{transcript}} . Here is the ended reason of the call: {{endedReason}}'
                  }
                ],
                schema: {
                  type: 'object',
                  properties: {
                    call_outcome: {
                      type: 'string',
                      enum: ['Answered', 'Not Answered'],
                      description: 'Sama ada panggilan dijawab oleh pelanggan atau tidak.'
                    },
                    stage_reached: {
                      type: 'string',
                      enum: ['Introduction', 'Fact Finding Masalah', 'Present Produk', 'Harga', 'Confirmation Order'],
                      description: 'Peringkat tertinggi yang dicapai dalam aliran perbualan.'
                    },
                    is_closed: {
                      type: 'string',
                      enum: ['Yes', 'No'],
                      description: 'Sama ada jualan ditutup (mencapai peringkat Confirmation Order).'
                    },
                    reason_not_closed: {
                      type: 'string',
                      description: 'Sebab utama panggilan tidak ditutup jika is_closed adalah No.'
                    },
                    customer_name: {
                      type: 'string',
                      description: 'Nama pelanggan jika berjaya dikumpulkan semasa panggilan.'
                    },
                    customer_address: {
                      type: 'string',
                      description: 'Alamat pelanggan jika berjaya dikumpulkan semasa panggilan.'
                    },
                    package_discussed: {
                      type: 'string',
                      enum: ['RM130 (3 botol)', 'RM100 (2 botol)', 'RM60 (1 botol)', 'No price discussed'],
                      description: 'Pakej harga mana yang telah dibincangkan.'
                    }
                  },
                  required: ['call_outcome', 'stage_reached', 'is_closed']
                }
              }
            }
          };

          const postData = {
            assistant: fullAssistantConfig,
            phoneNumber: phoneConfig,
            customer: { number: phoneNumber },
            metadata: {
              call_type: 'full_backend_cold_call',
              customer_phone: phoneNumber,
              product: 'Vitamin VTEC',
              timestamp: new Date().toISOString(),
              batch_id: campaign.id,
              prompt_version: promptId
            }
          };

          // Make call to VAPI API
          const response = await fetch('https://api.vapi.ai/call', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKeys.vapi_api_key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`VAPI API Error [${response.status}]: ${errorText.substring(0, 200)}`);
          }

          const responseData = await response.json();

          // Log successful call
          await supabaseAdmin.from('call_logs').insert({
            campaign_id: campaign.id,
            user_id: user.id,
            phone_number: phoneNumber,
            vapi_call_id: responseData.id,
            status: responseData.status || 'initiated',
            agent_id: responseData.assistantId || '',
            caller_number: phoneNumber,
            start_time: new Date().toISOString(),
            metadata: {
              vapi_response: responseData,
              batch_call: true
            }
          });

          console.log(`Successfully initiated call for ${phoneNumber}: ${responseData.id}`);
          return { success: true, phoneNumber, callId: responseData.id };

        } catch (error) {
          console.error(`Failed to call ${phoneNumber}:`, error.message);
          
          // Log failed call
          await supabaseAdmin.from('call_logs').insert({
            campaign_id: campaign.id,
            user_id: user.id,
            phone_number: phoneNumber,
            status: 'failed',
            agent_id: '',
            caller_number: phoneNumber,
            start_time: new Date().toISOString(),
            metadata: {
              error: error.message,
              batch_call: true
            }
          });

          return { success: false, phoneNumber, error: error.message };
        }
      });

      // Execute chunk concurrently
      const results = await Promise.all(callPromises);
      
      // Count successes and failures
      results.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      });

      // Wait between chunks to avoid rate limiting
      if (chunkIndex < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Update campaign status
    await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'completed',
        successful_calls: successCount,
        failed_calls: failureCount
      })
      .eq('id', campaign.id);

    console.log(`Batch call completed. Success: ${successCount}, Failed: ${failureCount}`);

    return new Response(JSON.stringify({
      message: `Batch call campaign completed successfully`,
      campaign_id: campaign.id,
      summary: {
        total_provided: phoneNumbers.length,
        valid_numbers: validPhones.length,
        invalid_numbers: invalidPhones.length,
        successful_calls: successCount,
        failed_calls: failureCount,
        chunks_processed: chunks.length,
        concurrent_limit_used: concurrentLimit
      },
      invalid_numbers: invalidPhones
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in batch-call function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});