import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Phone, 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Play,
  Clock,
  PhoneCall,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CallLog {
  id: string;
  agent_name: string;
  caller_number: string;
  duration: string;
  status: 'completed' | 'missed' | 'failed' | 'ongoing';
  started_at: string;
  ended_at?: string;
  transcript_available: boolean;
  cost: number;
}

export default function CallLogs() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock call logs for demonstration
  const callLogs: CallLog[] = [
    {
      id: '1',
      agent_name: 'Customer Support Agent',
      caller_number: '+1 (555) 123-4567',
      duration: '5:32',
      status: 'completed',
      started_at: '2024-01-22T10:30:00Z',
      ended_at: '2024-01-22T10:35:32Z',
      transcript_available: true,
      cost: 0.75,
    },
    {
      id: '2',
      agent_name: 'Sales Assistant',
      caller_number: '+1 (555) 987-6543',
      duration: '12:45',
      status: 'completed',
      started_at: '2024-01-22T09:15:00Z',
      ended_at: '2024-01-22T09:27:45Z',
      transcript_available: true,
      cost: 1.82,
    },
    {
      id: '3',
      agent_name: 'Customer Support Agent',
      caller_number: '+1 (555) 456-7890',
      duration: '0:00',
      status: 'missed',
      started_at: '2024-01-22T08:45:00Z',
      transcript_available: false,
      cost: 0.00,
    },
    {
      id: '4',
      agent_name: 'Technical Support',
      caller_number: '+1 (555) 321-9876',
      duration: '18:22',
      status: 'completed',
      started_at: '2024-01-21T16:20:00Z',
      ended_at: '2024-01-21T16:38:22Z',
      transcript_available: true,
      cost: 2.45,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: 'default',
      missed: 'secondary',
      failed: 'destructive',
      ongoing: 'default',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = 
      log.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.caller_number.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCalls = callLogs.length;
  const completedCalls = callLogs.filter(log => log.status === 'completed').length;
  const totalDuration = callLogs.reduce((acc, log) => {
    const [minutes, seconds] = log.duration.split(':').map(Number);
    return acc + minutes + (seconds / 60);
  }, 0);
  const totalCost = callLogs.reduce((acc, log) => acc + log.cost, 0);

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
            <Phone className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Call Logs</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor and analyze your AI agent call history
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-3 rounded-lg">
                <PhoneCall className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{totalCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-success p-3 rounded-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-secondary p-3 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">{Math.round(totalDuration)}min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="hero-gradient p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <CardTitle>Call History</CardTitle>
              <CardDescription>View and manage all your agent calls</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by agent name or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="failed">Failed</option>
                <option value="ongoing">Ongoing</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>

          {/* Calls Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.agent_name}
                    </TableCell>
                    <TableCell>{log.caller_number}</TableCell>
                    <TableCell>{log.duration}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{formatDateTime(log.started_at)}</TableCell>
                    <TableCell>${log.cost.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {log.transcript_available && (
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="mx-auto h-12 w-12 mb-4" />
              <p>No calls found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}