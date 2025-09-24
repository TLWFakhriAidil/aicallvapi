import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Phone, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Calendar,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatsCards } from '@/components/analytics/StatsCards';
import { RecentCampaigns } from '@/components/analytics/RecentCampaigns';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useCustomAuth();

  // Fetch dashboard analytics
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['dashboard-campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: callLogsData, isLoading: callLogsLoading } = useQuery({
    queryKey: ['dashboard-call-logs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate stats
  const stats = {
    totalCampaigns: campaignsData?.length || 0,
    totalCalls: callLogsData?.length || 0,
    successfulCalls: callLogsData?.filter(log => log.status === 'completed').length || 0,
    failedCalls: callLogsData?.filter(log => log.status === 'failed').length || 0,
    conversionRate: callLogsData?.length ? 
      (callLogsData.filter(log => log.status === 'completed').length / callLogsData.length) * 100 : 0,
    averageDuration: callLogsData?.length ? 
      callLogsData.reduce((acc, log) => acc + (log.duration || 0), 0) / callLogsData.length : 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success hover:bg-success/80">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your voice AI campaigns and performance.
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards 
            stats={stats} 
            isLoading={campaignsLoading || callLogsLoading} 
          />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Call Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Call Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Successful</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{stats.successfulCalls}</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.conversionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Failed</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{stats.failedCalls}</p>
                      <p className="text-xs text-muted-foreground">
                        {((stats.failedCalls / (stats.totalCalls || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">Avg Duration</span>
                    </div>
                    <p className="font-semibold">{Math.round(stats.averageDuration / 60)}min</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" asChild>
                  <Link to="/batch-call">
                    <Zap className="mr-2 h-4 w-4" />
                    Start New Campaign
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/prompts">
                    <Bot className="mr-2 h-4 w-4" />
                    Manage Prompts
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/call-logs">
                    <Phone className="mr-2 h-4 w-4" />
                    View Call Logs
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Connection</span>
                  <Badge variant="default" className="bg-success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Voice Service</span>
                  <Badge variant="default" className="bg-success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <RecentCampaigns 
            campaigns={campaignsData || []} 
            isLoading={campaignsLoading} 
          />

          {/* Getting Started (show only if no campaigns) */}
          {(!campaignsData || campaignsData.length === 0) && !campaignsLoading && (
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Get Started</span>
                  </CardTitle>
                  <CardDescription>
                    Set up your first voice AI campaign in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">1. Configure Your Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Set up your API keys and phone configuration to enable voice calling.
                      </p>
                      <Button variant="outline" asChild>
                        <Link to="/settings">Configure Settings</Link>
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium">2. Create Your First Campaign</h4>
                      <p className="text-sm text-muted-foreground">
                        Create prompts and launch your first batch calling campaign.
                      </p>
                      <Button asChild>
                        <Link to="/batch-call">Create Campaign</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}