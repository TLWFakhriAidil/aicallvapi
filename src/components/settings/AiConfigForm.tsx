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

// Schema for form validation
const aiConfigSchema = z.object({
  // Phone Configuration
  twilio_phone_number: z.string().min(1, 'Twilio phone number is required'),
  twilio_account_sid: z.string().min(1, 'Twilio Account SID is required'),
  twilio_auth_token: z.string().min(1, 'Twilio Auth Token is required'),
  
  // Voice Configuration
  country_code: z.string().default('+60'),
  default_name: z.string().default('AI Assistant'),
  concurrent_limit: z.number().min(1).max(10).default(3),
  manual_voice_id: z.string().optional(),
  
  // ElevenLabs Voice Parameters
  provider: z.string().default('11labs'),
  model: z.string().default('eleven_flash_v2_5'),
  stability: z.number().min(0).max(1).default(0.8),
  similarity_boost: z.number().min(0).max(1).default(1),
  style: z.number().min(0).max(1).default(0.0),
  use_speaker_boost: z.boolean().default(false),
  speed: z.number().min(0.25).max(4).default(0.8),
  optimize_streaming_latency: z.number().min(0).max(4).default(4),
  auto_mode: z.boolean().default(true),
});

type AiConfigFormData = z.infer<typeof aiConfigSchema>;

interface AiConfigData extends AiConfigFormData {
  id: string;
}

export function AiConfigForm() {
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AiConfigFormData>({
    resolver: zodResolver(aiConfigSchema),
    defaultValues: {
      twilio_phone_number: '',
      twilio_account_sid: '',
      twilio_auth_token: '',
      country_code: '+60',
      default_name: 'AI Assistant',
      concurrent_limit: 3,
      manual_voice_id: '',
      provider: '11labs',
      model: 'eleven_flash_v2_5',
      stability: 0.8,
      similarity_boost: 1,
      style: 0.0,
      use_speaker_boost: false,
      speed: 0.8,
      optimize_streaming_latency: 4,
      auto_mode: true,
    },
  });

  // Fetch existing AI config
  const { data: aiConfig, isLoading } = useQuery({
    queryKey: ['ai-config', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get phone config
      const { data: phoneData } = await supabase
        .from('phone_config')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Get voice config (we'll create this table)
      const { data: voiceData } = await supabase
        .from('voice_config')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return {
        phone_config: phoneData,
        voice_config: voiceData
      };
    },
    enabled: !!user,
  });

  // Auto-populate form when data is loaded
  useEffect(() => {
    if (aiConfig?.phone_config) {
      const phoneConfig = aiConfig.phone_config;
      const voiceConfig = aiConfig.voice_config;
      
      form.reset({
        twilio_phone_number: phoneConfig.twilio_phone_number || '',
        twilio_account_sid: phoneConfig.twilio_account_sid || '',
        twilio_auth_token: phoneConfig.twilio_auth_token || '',
        country_code: voiceConfig?.country_code || '+60',
        default_name: voiceConfig?.default_name || 'AI Assistant',
        concurrent_limit: voiceConfig?.concurrent_limit || 3,
        manual_voice_id: voiceConfig?.manual_voice_id || '',
        provider: voiceConfig?.provider || '11labs',
        model: voiceConfig?.model || 'eleven_flash_v2_5',
        stability: voiceConfig?.stability || 0.8,
        similarity_boost: voiceConfig?.similarity_boost || 1,
        style: voiceConfig?.style || 0.0,
        use_speaker_boost: voiceConfig?.use_speaker_boost || false,
        speed: voiceConfig?.speed || 0.8,
        optimize_streaming_latency: voiceConfig?.optimize_streaming_latency || 4,
        auto_mode: voiceConfig?.auto_mode || true,
      });
    }
  }, [aiConfig, form]);

  // Mutation for saving AI config
  const saveMutation = useMutation({
    mutationFn: async (data: AiConfigFormData) => {
      if (!user) throw new Error('User not authenticated');

      // Save phone config
      const phoneConfigData = {
        twilio_phone_number: data.twilio_phone_number,
        twilio_account_sid: data.twilio_account_sid,
        twilio_auth_token: data.twilio_auth_token,
        updated_at: new Date().toISOString()
      };

      // Check if phone config exists
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

      // Save voice config
      const voiceConfigData = {
        country_code: data.country_code,
        default_name: data.default_name,
        concurrent_limit: data.concurrent_limit,
        manual_voice_id: data.manual_voice_id,
        provider: data.provider,
        model: data.model,
        stability: data.stability,
        similarity_boost: data.similarity_boost,
        style: data.style,
        use_speaker_boost: data.use_speaker_boost,
        speed: data.speed,
        optimize_streaming_latency: data.optimize_streaming_latency,
        auto_mode: data.auto_mode,
        updated_at: new Date().toISOString()
      };

      // Check if voice config exists
      const { data: existingVoiceConfig } = await supabase
        .from('voice_config')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVoiceConfig) {
        await supabase
          .from('voice_config')
          .update(voiceConfigData)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('voice_config')
          .insert({
            user_id: user.id,
            ...voiceConfigData
          });
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'AI configuration saved successfully!',
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
    const manualVoiceId = form.getValues('manual_voice_id');
    const defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // sarah voice ID
    
    return manualVoiceId && manualVoiceId.trim() !== '' 
      ? manualVoiceId 
      : defaultVoiceId;
  };

  const onSubmit = (data: AiConfigFormData) => {
    saveMutation.mutate(data);
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Phone Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Phone Configuration</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="country_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+60" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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

                  <FormField
                    control={form.control}
                    name="default_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Assistant Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="AI Assistant" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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

                  <FormField
                    control={form.control}
                    name="concurrent_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Concurrent Call Limit</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1" 
                            max="10" 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Voice Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Voice Configuration</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="manual_voice_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manual Voice ID (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Leave empty to use default 'sarah'" />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Current Voice ID: {getVoiceId()} {!form.getValues('manual_voice_id') && '(Default: Sarah)'}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ElevenLabs Model</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="eleven_flash_v2_5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stability (0-1)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="1"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="similarity_boost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Similarity Boost (0-1)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="1"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="speed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Speed (0.25-4)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.1" 
                            min="0.25" 
                            max="4"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save AI Configuration'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}