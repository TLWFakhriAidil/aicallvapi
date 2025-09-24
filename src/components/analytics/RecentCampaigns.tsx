import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface Campaign {
  id: string;
  campaign_name: string;
  status: string;
  total_numbers: number;
  successful_calls: number;
  failed_calls: number;
  created_at: string;
}

interface RecentCampaignsProps {
  campaigns: Campaign[];
  isLoading?: boolean;
}

export function RecentCampaigns({ campaigns, isLoading }: RecentCampaignsProps) {
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

  const getSuccessRate = (successful: number, total: number) => {
    if (total === 0) return 0;
    return ((successful / total) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>
            Your latest campaign performance
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/campaigns">
            View All
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No campaigns found</p>
            <Button asChild>
              <Link to="/batch-call">Create Your First Campaign</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.slice(0, 5).map((campaign) => {
              const successRate = getSuccessRate(
                campaign.successful_calls || 0, 
                campaign.total_numbers || 0
              );
              
              return (
                <div 
                  key={campaign.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-foreground">
                        {campaign.campaign_name}
                      </h4>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{campaign.total_numbers || 0} total calls</span>
                      <span>{campaign.successful_calls || 0} successful</span>
                      <span className="text-success font-medium">{successRate}% success rate</span>
                      <span>
                        {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/campaigns">
                      View Details
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}