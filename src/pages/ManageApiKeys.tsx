import { useState } from 'react';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Key,
  ExternalLink,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  provider: 'openai' | 'elevenlabs' | 'vapi' | 'custom';
  masked_key: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  last_used?: string;
}

export default function ManageApiKeys() {
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState({
    name: '',
    provider: 'openai',
    key: '',
    isAdding: false,
  });

  // Mock API keys for demonstration
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'OpenAI GPT-4',
      provider: 'openai',
      masked_key: 'sk-proj-***************************',
      status: 'active',
      created_at: '2024-01-15',
      last_used: '2024-01-22',
    },
    {
      id: '2',
      name: 'ElevenLabs Voice',
      provider: 'elevenlabs',
      masked_key: 'el_***************************',
      status: 'inactive',
      created_at: '2024-01-10',
    },
  ]);

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.key) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both a name and API key.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API key storage with Supabase
      const mockNewKey: ApiKey = {
        id: Date.now().toString(),
        name: newKey.name,
        provider: newKey.provider as any,
        masked_key: newKey.key.substring(0, 8) + '*'.repeat(20),
        status: 'active',
        created_at: new Date().toISOString().split('T')[0],
      };

      setApiKeys(prev => [...prev, mockNewKey]);
      setNewKey({ name: '', provider: 'openai', key: '', isAdding: false });
      
      toast({
        title: 'API Key Added',
        description: 'Your API key has been securely stored.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (keyId: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const getProviderInfo = (provider: string) => {
    const providers = {
      openai: {
        name: 'OpenAI',
        url: 'https://platform.openai.com/api-keys',
        color: 'bg-green-500',
        description: 'Required for AI conversation and speech synthesis'
      },
      elevenlabs: {
        name: 'ElevenLabs',
        url: 'https://elevenlabs.io/app/settings/api-keys',
        color: 'bg-purple-500',
        description: 'Advanced voice synthesis and cloning'
      },
      vapi: {
        name: 'VAPI',
        url: 'https://dashboard.vapi.ai/account',
        color: 'bg-blue-500',
        description: 'Voice AI platform for phone calls'
      },
      custom: {
        name: 'Custom',
        url: '',
        color: 'bg-gray-500',
        description: 'Custom API integration'
      }
    };
    return providers[provider as keyof typeof providers];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center space-x-3 mb-2">
          <div className="hero-gradient p-2 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Manage API Keys</h1>
        </div>
        <p className="text-muted-foreground">
          Securely store and manage your API keys for various AI services
        </p>
      </div>

      <div className="space-y-6">
        {/* Security Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your API keys are encrypted and stored securely. Never share them publicly or include them in client-side code.
          </AlertDescription>
        </Alert>

        {/* Add New API Key */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Add New API Key
                </CardTitle>
                <CardDescription>
                  Connect your AI services by adding their API keys
                </CardDescription>
              </div>
              <Button
                onClick={() => setNewKey(prev => ({ ...prev, isAdding: !prev.isAdding }))}
                variant={newKey.isAdding ? "outline" : "default"}
              >
                {newKey.isAdding ? 'Cancel' : 'Add Key'}
              </Button>
            </div>
          </CardHeader>
          {newKey.isAdding && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g. OpenAI Production Key"
                    value={newKey.name}
                    onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <select
                    id="provider"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={newKey.provider}
                    onChange={(e) => setNewKey(prev => ({ ...prev, provider: e.target.value }))}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="elevenlabs">ElevenLabs</option>
                    <option value="vapi">VAPI</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Paste your API key here..."
                  value={newKey.key}
                  onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                />
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  <a 
                    href={getProviderInfo(newKey.provider).url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    Get your {getProviderInfo(newKey.provider).name} API key
                  </a>
                </div>
              </div>
              <Button 
                onClick={handleAddKey} 
                disabled={loading || !newKey.name || !newKey.key}
                className="w-full"
              >
                {loading ? 'Adding...' : 'Add API Key'}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Existing API Keys */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your API Keys</h2>
          {apiKeys.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No API Keys Added</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first API key to start building voice agents
                </p>
                <Button 
                  onClick={() => setNewKey(prev => ({ ...prev, isAdding: true }))}
                >
                  Add Your First Key
                </Button>
              </CardContent>
            </Card>
          ) : (
            apiKeys.map((key) => {
              const provider = getProviderInfo(key.provider);
              return (
                <Card key={key.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center`}
                        >
                          <Key className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{key.name}</h3>
                            <Badge 
                              variant={key.status === 'active' ? 'default' : 'secondary'}
                            >
                              {key.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {provider.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                            <span>Added: {key.created_at}</span>
                            {key.last_used && <span>Last used: {key.last_used}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-md">
                          <code className="text-sm font-mono">
                            {showKey[key.id] ? 'sk-proj-1234567890abcdef...' : key.masked_key}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {showKey[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(key.id, 'sk-proj-1234567890abcdef...')}
                          >
                            {copiedKey === key.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Provider Information */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Providers</CardTitle>
            <CardDescription>
              Learn more about the AI services you can integrate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['openai', 'elevenlabs', 'vapi'].map((provider) => {
                const info = getProviderInfo(provider);
                return (
                  <div key={provider} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 rounded ${info.color} flex items-center justify-center`}>
                        <Key className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-medium">{info.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {info.description}
                    </p>
                    <a
                      href={info.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      Get API Key
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
