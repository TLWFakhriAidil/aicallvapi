import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, Phone, Mic, Settings } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ApiKeysForm } from '@/components/api-keys/ApiKeysForm';

// Schema for phone configuration
const phoneConfigSchema = z.object({
  twilio_phone_number: z.string().min(1, 'Twilio phone number is required'),
  twilio_account_sid: z.string().min(1, 'Twilio Account SID is required'),
  twilio_auth_token: z.string().min(1, 'Twilio Auth Token is required'),
});

// Schema for voice configuration
const voiceConfigSchema = z.object({
  manual_voice_id: z.string().optional(),
});

type PhoneConfigFormData = z.infer<typeof phoneConfigSchema>;
type VoiceConfigFormData = z.infer<typeof voiceConfigSchema>;

export function AiConfigForm() {
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const phoneForm = useForm<PhoneConfigFormData>({
    resolver: zodResolver(phoneConfigSchema),
    defaultValues: {
      twilio_phone_number: '',
      twilio_account_sid: '',
      twilio_auth_token: '',
    },
  });

  const voiceForm = useForm<VoiceConfigFormData>({
    resolver: zodResolver(voiceConfigSchema),
    defaultValues: {
      manual_voice_id: '',
    },
  });

  // Fetch existing AI config
  const { data: aiConfig, isLoading } = useQuery({
    queryKey: ['ai-config', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        // Get phone config
        const { data: phoneData, error: phoneError } = await supabase
          .from('phone_config')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (phoneError && phoneError.code !== 'PGRST116') {
          console.error('Phone config error:', phoneError);
        }

        // Get voice config using a direct query - cast to any to bypass TypeScript
        let voiceData = null;
        try {
          const { data: vData, error: voiceError } = await (supabase as any)
            .from('voice_config')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (!voiceError) {
            voiceData = vData;
          }
        } catch (error) {
          console.log('Voice config table not ready yet');
        }
        
        return {
          phone_config: phoneData,
          voice_config: voiceData
        };
      } catch (error) {
        console.error('Error fetching AI config:', error);
        return {
          phone_config: null,
          voice_config: null
        };
      }
    },
    enabled: !!user,
  });

  // Auto-populate forms when data is loaded
  useEffect(() => {
    if (aiConfig) {
      const phoneConfig = aiConfig.phone_config;
      const voiceConfig = aiConfig.voice_config;
      
      // Reset phone form
      phoneForm.reset({
        twilio_phone_number: phoneConfig?.twilio_phone_number || '',
        twilio_account_sid: phoneConfig?.twilio_account_sid || '',
        twilio_auth_token: phoneConfig?.twilio_auth_token || '',
      });

      // Reset voice form
      voiceForm.reset({
        manual_voice_id: voiceConfig?.manual_voice_id || '',
      });
    }
  }, [aiConfig, phoneForm, voiceForm]);

  // Mutation for saving phone config
  const savePhoneMutation = useMutation({
    mutationFn: async (data: PhoneConfigFormData) => {
      if (!user) throw new Error('User not authenticated');

      const phoneConfigData = {
        twilio_phone_number: data.twilio_phone_number,
        twilio_account_sid: data.twilio_account_sid,
        twilio_auth_token: data.twilio_auth_token,
        updated_at: new Date().toISOString()
      };

      const { data: existingPhoneConfig } = await supabase
        .from('phone_config')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingPhoneConfig) {
        await supabase
          .from('phone_config')
          .update(phoneConfigData)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('phone_config')
          .insert({
            user_id: user.id,
            ...phoneConfigData
          });
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Phone configuration saved successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['ai-config', user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation for saving voice config
  const saveVoiceMutation = useMutation({
    mutationFn: async (data: VoiceConfigFormData) => {
      if (!user) throw new Error('User not authenticated');

      try {
        // Check if voice config exists for this user
        const { data: existingConfig, error: checkError } = await (supabase as any)
          .from('voice_config')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing voice config:', checkError);
          throw new Error(`Failed to check voice configuration: ${checkError.message}`);
        }

        const voiceConfigData = {
          manual_voice_id: data.manual_voice_id || null,
          updated_at: new Date().toISOString()
        };

        if (existingConfig) {
          // Update existing config
          const { error: updateError } = await (supabase as any)
            .from('voice_config')
            .update(voiceConfigData)
            .eq('user_id', user.id);
          
          if (updateError) {
            console.error('Voice config update error:', updateError);
            throw new Error(`Failed to update voice configuration: ${updateError.message}`);
          }
        } else {
          // Insert new config
          const { error: insertError } = await (supabase as any)
            .from('voice_config')
            .insert({
              user_id: user.id,
              ...voiceConfigData
            });
          
          if (insertError) {
            console.error('Voice config insert error:', insertError);
            throw new Error(`Failed to create voice configuration: ${insertError.message}`);
          }
        }
      } catch (error) {
        console.error('Error saving voice config:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Voice configuration saved successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['ai-config', user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Helper function to get voice ID
  const getVoiceId = () => {
    const manualVoiceId = voiceForm.getValues('manual_voice_id');
    const defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // sarah voice ID
    
    return manualVoiceId && manualVoiceId.trim() !== '' 
      ? manualVoiceId 
      : defaultVoiceId;
  };

  const onSubmitPhone = (data: PhoneConfigFormData) => {
    savePhoneMutation.mutate(data);
  };

  const onSubmitVoice = (data: VoiceConfigFormData) => {
    saveVoiceMutation.mutate(data);
  };

  const isConfigured = aiConfig?.phone_config || aiConfig?.voice_config;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Keys Section */}
      <ApiKeysForm />
      
      {/* Unified AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              AI Configuration
            </span>
            {isConfigured ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="w-3 h-3 mr-1" />
                Not Configured
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Configure phone services and voice settings for your AI assistant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Phone Configuration Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <h3 className="text-lg font-medium">Phone Configuration</h3>
            </div>
            
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={phoneForm.control}
                    name="twilio_phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twilio Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+17755242070" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={phoneForm.control}
                    name="twilio_account_sid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twilio Account SID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ACb04sasfa234bd27d7ee7be008cf4be5d" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={phoneForm.control}
                  name="twilio_auth_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twilio Auth Token</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="c9dcesa53f6b38b1c1a0b810dc5a3835" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={savePhoneMutation.isPending}
                >
                  {savePhoneMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Phone Config...
                    </>
                  ) : (
                    'Save Phone Configuration'
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <Separator />

          {/* Voice Configuration Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <h3 className="text-lg font-medium">Voice Configuration</h3>
            </div>
            
            <Form {...voiceForm}>
              <form onSubmit={voiceForm.handleSubmit(onSubmitVoice)} className="space-y-4">
                <FormField
                  control={voiceForm.control}
                  name="manual_voice_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manual Voice ID (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Leave empty to use default 'sarah'" />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Current Voice ID: {getVoiceId()} {!voiceForm.getValues('manual_voice_id') && '(Default: Sarah)'}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={saveVoiceMutation.isPending}
                >
                  {saveVoiceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Voice Config...
                    </>
                  ) : (
                    'Save Voice Configuration'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}