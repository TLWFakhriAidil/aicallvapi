import { useState } from 'react';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bot, ArrowLeft, Play, Save, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function CreateAgent() {
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    voice: 'alloy',
    personality: 'professional',
    systemPrompt: '',
    greeting: '',
    language: 'en',
    responseTime: 'normal',
    enableTranscription: true,
    enableAnalytics: true,
    maxCallDuration: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement agent creation with Supabase
      toast({
        title: 'Agent Created',
        description: `${formData.name} has been created successfully!`,
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        voice: 'alloy',
        personality: 'professional',
        systemPrompt: '',
        greeting: '',
        language: 'en',
        responseTime: 'normal',
        enableTranscription: true,
        enableAnalytics: true,
        maxCallDuration: 30,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create agent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
            <Bot className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create New Agent</h1>
        </div>
        <p className="text-muted-foreground">
          Configure your AI voice agent with custom personality and behavior
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set up the fundamental details of your agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Customer Support Agent"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => handleInputChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of what this agent does..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Voice & Personality */}
            <Card>
              <CardHeader>
                <CardTitle>Voice & Personality</CardTitle>
                <CardDescription>Configure how your agent sounds and behaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice">Voice</Label>
                    <Select
                      value={formData.voice}
                      onValueChange={(value) => handleInputChange('voice', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                        <SelectItem value="echo">Echo (Male)</SelectItem>
                        <SelectItem value="fable">Fable (British)</SelectItem>
                        <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                        <SelectItem value="nova">Nova (Female)</SelectItem>
                        <SelectItem value="shimmer">Shimmer (Soft)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personality">Personality</Label>
                    <Select
                      value={formData.personality}
                      onValueChange={(value) => handleInputChange('personality', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="greeting">Welcome Greeting</Label>
                  <Input
                    id="greeting"
                    placeholder="Hello! How can I help you today?"
                    value={formData.greeting}
                    onChange={(e) => handleInputChange('greeting', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Instructions</Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="You are a helpful AI assistant. Be professional, friendly, and concise in your responses..."
                    value={formData.systemPrompt}
                    onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                    rows={5}
                  />
                  <p className="text-sm text-muted-foreground">
                    Define how your agent should behave and respond to users
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  <Play className="mr-2 h-4 w-4" />
                  Test Voice
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  disabled
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Preview Call
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="responseTime">Response Speed</Label>
                  <Select
                    value={formData.responseTime}
                    onValueChange={(value) => handleInputChange('responseTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="thoughtful">Thoughtful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxDuration">Max Call Duration (minutes)</Label>
                  <Input
                    id="maxDuration"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.maxCallDuration}
                    onChange={(e) => handleInputChange('maxCallDuration', parseInt(e.target.value))}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Call Transcription</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable automatic transcription
                      </p>
                    </div>
                    <Switch
                      checked={formData.enableTranscription}
                      onCheckedChange={(checked) => handleInputChange('enableTranscription', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Track performance metrics
                      </p>
                    </div>
                    <Switch
                      checked={formData.enableAnalytics}
                      onCheckedChange={(checked) => handleInputChange('enableAnalytics', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link to="/dashboard">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading || !formData.name}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </div>
  );
}