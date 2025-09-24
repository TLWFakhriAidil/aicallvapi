import { useState } from 'react';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  User, 
  Bell,
  Shield,
  CreditCard,
  Trash2,
  Save,
  Key,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ApiKeysForm } from '@/components/api-keys/ApiKeysForm';
import { PhoneConfigForm } from '@/components/settings/PhoneConfigForm';
import { VoiceProviderSettings } from '@/components/settings/VoiceProviderSettings';
import { ChangePasswordSection } from '@/components/ChangePasswordSection';
import { Header } from '@/components/Header';

export default function Settings() {
  const { user, signOut } = useCustomAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    company: '',
    phone: '',
    timezone: 'UTC',
  });

  const [notifications, setNotifications] = useState({
    callAlerts: true,
    emailReports: true,
    maintenanceUpdates: false,
    marketingEmails: false,
  });

  const [privacy, setPrivacy] = useState({
    callRecording: true,
    dataRetention: '90',
    anonymizeData: false,
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // TODO: Update user profile with Supabase
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Update notification preferences
      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
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
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            </div>
            <p className="text-muted-foreground">
              Manage your account preferences and application settings
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Password</span>
              </TabsTrigger>
              <TabsTrigger value="api-config" className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>API Config</span>
              </TabsTrigger>
              <TabsTrigger value="voice-providers" className="flex items-center space-x-2">
                <SettingsIcon className="h-4 w-4" />
                <span>Voice</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Billing</span>
              </TabsTrigger>
            </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user?.username || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Username cannot be changed. Contact support if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Your company name"
                    value={profile.company}
                    onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={profile.timezone}
                    onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-6">
          <ChangePasswordSection />
        </TabsContent>

        {/* API Configuration Tab */}
        <TabsContent value="api-config" className="space-y-6">
          <div className="space-y-6">
            <ApiKeysForm />
            <PhoneConfigForm />
          </div>
        </TabsContent>

        {/* Voice Providers Tab */}
        <TabsContent value="voice-providers" className="space-y-6">
          <VoiceProviderSettings />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about important events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Call Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when calls start or end
                    </p>
                  </div>
                  <Switch
                    checked={notifications.callAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, callAlerts: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily and weekly usage reports
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailReports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailReports: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      System maintenance and downtime notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.maintenanceUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, maintenanceUpdates: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Product updates and promotional content
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, marketingEmails: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Control how your data is collected and stored
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Call Recording</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable recording for quality and training purposes
                    </p>
                  </div>
                  <Switch
                    checked={privacy.callRecording}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, callRecording: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention (days)</Label>
                  <select
                    id="dataRetention"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={privacy.dataRetention}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, dataRetention: e.target.value }))}
                  >
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    How long to keep call logs and transcriptions
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anonymize Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Remove personally identifiable information from logs
                    </p>
                  </div>
                  <Switch
                    checked={privacy.anonymizeData}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, anonymizeData: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>
                Manage your subscription and payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-6 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="hero-gradient p-3 rounded-lg">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Free Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      You're currently on the free plan
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      Active
                    </Badge>
                  </div>
                </div>
                <Button>
                  Upgrade Plan
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold mb-2">This Month</h4>
                    <p className="text-2xl font-bold text-primary">$0.00</p>
                    <p className="text-sm text-muted-foreground">Usage charges</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold mb-2">API Calls</h4>
                    <p className="text-2xl font-bold">127</p>
                    <p className="text-sm text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <h4 className="font-semibold mb-2">Minutes Used</h4>
                    <p className="text-2xl font-bold">45.2</p>
                    <p className="text-sm text-muted-foreground">Call duration</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}