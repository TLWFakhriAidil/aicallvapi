import { Card, CardContent } from '@/components/ui/card';
import { 
  Bot, 
  Phone, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalCampaigns: number;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    conversionRate: number;
    averageDuration: number;
    trendsData?: {
      campaignsTrend: number;
      callsTrend: number;
      conversionTrend: number;
    };
  };
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return null;
  };

  const getTrendText = (trend: number) => {
    if (trend === 0) return null;
    const sign = trend > 0 ? '+' : '';
    return (
      <span className={`text-sm ${trend > 0 ? 'text-success' : 'text-destructive'}`}>
        {sign}{trend.toFixed(1)}% from last period
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Campaigns',
      value: stats.totalCampaigns,
      icon: Bot,
      gradient: 'hero-gradient',
      trend: stats.trendsData?.campaignsTrend || 0,
    },
    {
      title: 'Total Calls',
      value: stats.totalCalls,
      icon: Phone,
      gradient: 'bg-primary',
      trend: stats.trendsData?.callsTrend || 0,
    },
    {
      title: 'Success Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: CheckCircle,
      gradient: 'bg-success',
      trend: stats.trendsData?.conversionTrend || 0,
    },
    {
      title: 'Avg Duration',
      value: `${Math.round(stats.averageDuration / 60)}m`,
      icon: Clock,
      gradient: 'bg-secondary',
      trend: 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  {card.trend !== 0 && (
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(card.trend)}
                      {getTrendText(card.trend)}
                    </div>
                  )}
                </div>
                <div className={`${card.gradient} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}