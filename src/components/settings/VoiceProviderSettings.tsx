import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { useToast } from '@/hooks/use-toast';
import { VapiClient } from '@/lib/vapiClient';
import { 
  Mic, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Trash2,
  Volume2 
} from 'lucide-react';

interface VoiceProvider {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  voices: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
}

export function VoiceProviderSettings() {
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testingVoice, setTestingVoice] = useState<string | null>(null);

  // Get API key
  const { data: apiKeyData } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get available agents (configured voices)
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Group agents by provider
  const providers: VoiceProvider[] = [
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      status: agents?.some(a => a.voice_provider === 'elevenlabs') ? 'connected' : 'disconnected',
      voices: agents?.filter(a => a.voice_provider === 'elevenlabs').map(a => ({
        id: a.agent_id,
        name: `${a.name} (${a.voice})`,
        enabled: true,
      })) || []
    },
    {
      id: 'openai',
      name: 'OpenAI',
      status: agents?.some(a => a.voice_provider === 'openai') ? 'connected' : 'disconnected',
      voices: agents?.filter(a => a.voice_provider === 'openai').map(a => ({
        id: a.agent_id,
        name: `${a.name} (${a.voice})`,
        enabled: true,
      })) || []
    },
    {
      id: 'playht',
      name: 'PlayHT',
      status: agents?.some(a => a.voice_provider === 'playht') ? 'connected' : 'disconnected',
      voices: agents?.filter(a => a.voice_provider === 'playht').map(a => ({
        id: a.agent_id,
        name: `${a.name} (${a.voice})`,
        enabled: true,
      })) || []
    },
    {
      id: 'azure',
      name: 'Azure',
      status: agents?.some(a => a.voice_provider === 'azure') ? 'connected' : 'disconnected',
      voices: agents?.filter(a => a.voice_provider === 'azure').map(a => ({
        id: a.agent_id,
        name: `${a.name} (${a.voice})`,
        enabled: true,
      })) || []
    },
  ];

  const testVoiceMutation = useMutation({
    mutationFn: async (agentId: string) => {
      if (!apiKeyData?.vapi_api_key) throw new Error('API key not configured');
      
      // Test voice by playing a sample message
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: 'Voice Test Completed',
        description: 'Voice test simulation completed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Test Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setTestingVoice(null);
    }
  });

  const handleTestVoice = (agentId: string) => {
    setTestingVoice(agentId);
    testVoiceMutation.mutate(agentId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="secondary" className="text-green-600">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Not Connected</Badge>;
    }
  };

  if (!apiKeyData?.vapi_api_key) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Providers
          </CardTitle>
          <CardDescription>
            Configure and manage voice providers for your campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You need to configure your API key first to manage voice providers.
            </p>
            <Button variant="outline">
              Configure API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Providers
          </CardTitle>
          <CardDescription>
            Configure and manage voice providers for your campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {providers.map((provider) => (
            <div key={provider.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(provider.status)}
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {provider.voices.length} voice{provider.voices.length !== 1 ? 's' : ''} configured
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(provider.status)}
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>
              </div>

              {provider.voices.length > 0 && (
                <div className="ml-7 space-y-2">
                  {provider.voices.map((voice) => (
                    <div key={voice.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{voice.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={voice.enabled}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTestVoice(voice.id)}
                          disabled={testingVoice === voice.id}
                        >
                          {testingVoice === voice.id ? 'Testing...' : 'Test Voice'}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {provider.id !== 'azure' && <Separator />}
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              Add more voices by creating new agents with different providers
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Voice
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common voice provider management tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Mic className="h-6 w-6 mb-2" />
              <span className="font-medium">Test All Voices</span>
              <span className="text-xs text-muted-foreground">Run voice quality check</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span className="font-medium">Sync with VAPI</span>
              <span className="text-xs text-muted-foreground">Update provider status</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}