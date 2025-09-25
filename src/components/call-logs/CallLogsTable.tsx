import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Phone, Search, Calendar, Clock, Play, FileText, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AudioPlayerDialog } from '@/components/ui/audio-player-dialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface CallLog {
  id: string;
  call_id: string;
  user_id: string;
  campaign_id?: string;
  agent_id: string;
  caller_number: string;
  phone_number: string;
  vapi_call_id?: string;
  start_time: string;
  duration?: number;
  status: string;
  created_at: string;
  updated_at: string;
  end_of_call_report?: any;
  metadata?: {
    recording_url?: string;
    transcript?: string;
    summary?: string;
    call_cost?: number;
    [key: string]: any;
  };
}

interface Agent {
  id: string;
  agent_id: string;
  name: string;
}

export function CallLogsTable() {
  const { user } = useCustomAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Get call logs from Supabase
  const { data: callLogs, isLoading, error } = useQuery({
    queryKey: ['call-logs', user?.id, dateRange],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Date Range:', dateRange);
      
      // Build query with date filtering
      let query = supabase
        .from('call_logs')
        .select('*')
        .eq('user_id', user.id);

      // Add date range filter if provided
      if (dateRange?.from) {
        // Set to start of day in local timezone, then convert to UTC
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        const fromISO = fromDate.toISOString();
        console.log('Filtering from date:', fromISO);
        query = query.gte('created_at', fromISO);
      }
      if (dateRange?.to) {
        // Set to end of day in local timezone, then convert to UTC
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        const toISO = toDate.toISOString();
        console.log('Filtering to date:', toISO);
        query = query.lte('created_at', toISO);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CallLog[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
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
    log.caller_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAgentName(log.agent_id).toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalCost = filteredLogs.reduce(
    (sum, log) => sum + (log.metadata?.call_cost || 0), 
    0
  );


  const renderRecordingButton = (log: any) => {
    // Check multiple possible locations for recording URL
    const recordingUrl = log?.metadata?.recording_url || 
                        log?.end_of_call_report?.call?.recording?.url ||
                        log?.end_of_call_report?.recording_url ||
                        log?.metadata?.recordingUrl;
    
    if (!recordingUrl) {
      return <span className="text-muted-foreground">No recording</span>;
    }
    
    return (
      <AudioPlayerDialog
        recordingUrl={recordingUrl}
        triggerButton={
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Play
          </Button>
        }
      />
    );
  };

  const renderTranscriptDialog = (transcript?: string) => {
    if (!transcript) return <span className="text-muted-foreground">No transcript</span>;
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Call Transcript</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96 w-full">
            <div className="whitespace-pre-wrap text-sm p-4 bg-muted rounded-md">
              {transcript}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  const renderSummaryDialog = (summary?: string) => {
    if (!summary) return <span className="text-muted-foreground">No summary</span>;
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Summary</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96 w-full">
            <div className="whitespace-pre-wrap text-sm p-4 bg-muted rounded-md">
              {summary}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };


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
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by caller or agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            placeholder="Tapis mengikut tarikh"
          />
        </div>
      </CardHeader>
      <CardContent>

      <div className="mb-4 flex items-center gap-2 font-semibold">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        Jumlah Kos: <span>{totalCost.toFixed(4)} USD</span>
      </div>
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
                <TableHead>Recording</TableHead>
                <TableHead>Transcript</TableHead>
                <TableHead>AI Summary</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Started At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.caller_number || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {getAgentName(log.agent_id)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(log.status)}
                  </TableCell>
                  <TableCell>
                    {formatDuration(log.duration)}
                  </TableCell>
                  <TableCell>
                    {renderRecordingButton(log)}
                  </TableCell>
                  <TableCell>
                    {renderTranscriptDialog(log.metadata?.transcript)}
                  </TableCell>
                  <TableCell>
                    {renderSummaryDialog(log.metadata?.summary)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {log.metadata?.call_cost ? `$${log.metadata.call_cost.toFixed(4)}` : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(log.start_time).toLocaleDateString()}
                      <Clock className="h-4 w-4 ml-2 mr-1" />
                      {new Date(log.start_time).toLocaleTimeString()}
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