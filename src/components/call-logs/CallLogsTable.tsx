import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Phone, Search, Calendar, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { VapiClient, VapiCallLog } from '@/lib/vapiClient';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Agent {
  id: string;
  agent_id: string;
  name: string;
}

export function CallLogsTable() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

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

  // Get agents
  const { data: agents } = useQuery({
    queryKey: ['agents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as Agent[];
    },
    enabled: !!user,
  });

  // Get call logs from Vapi
  const { data: callLogs, isLoading, error } = useQuery({
    queryKey: ['call-logs', apiKeyData?.vapi_api_key],
    queryFn: async () => {
      if (!apiKeyData?.vapi_api_key) return [];
      const vapiClient = new VapiClient(apiKeyData.vapi_api_key);
      return await vapiClient.getCallLogs();
    },
    enabled: !!apiKeyData?.vapi_api_key,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getAgentName = (assistantId: string) => {
    const agent = agents?.find(a => a.agent_id === assistantId);
    return agent?.name || 'Unknown Agent';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ended': { variant: 'default' as const, label: 'Completed' },
      'in-progress': { variant: 'default' as const, label: 'In Progress' },
      'queued': { variant: 'secondary' as const, label: 'Queued' },
      'ringing': { variant: 'secondary' as const, label: 'Ringing' },
      'forwarding': { variant: 'outline' as const, label: 'Forwarding' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredLogs = callLogs?.filter(log => 
    log.customer.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAgentName(log.assistantId).toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!apiKeyData?.vapi_api_key) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call Logs</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">You need to configure your API key first to view call logs.</p>
          <Button asChild>
            <Link to="/api-keys">Configure API Key</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call Logs</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-destructive">Error loading call logs: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Logs</CardTitle>
        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by caller or agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        ) : filteredLogs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caller</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Started At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.customer.number || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {getAgentName(log.assistantId)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log.status)}
                  </TableCell>
                  <TableCell>
                    {formatDuration(log.duration)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(log.startedAt).toLocaleDateString()}
                      <Clock className="h-4 w-4 ml-2 mr-1" />
                      {new Date(log.startedAt).toLocaleTimeString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No call logs match your search' : 'No call logs found'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}