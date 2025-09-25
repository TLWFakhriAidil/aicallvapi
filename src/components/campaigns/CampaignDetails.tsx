import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AudioPlayerDialog } from "@/components/ui/audio-player-dialog";
import { ArrowLeft, Phone, CheckCircle, XCircle, Clock, BarChart3, Play, FileText, DollarSign } from "lucide-react";

interface CampaignDetailsProps {
  campaignId: string;
  onBack: () => void;
}

export function CampaignDetails({ campaignId, onBack }: CampaignDetailsProps) {
  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      // First get campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Then get the prompt if it exists
      let promptData = null;
      if (campaignData.prompt_id) {
        const { data: prompt } = await supabase
          .from('prompts')
          .select('prompt_name, first_message, system_prompt')
          .eq('id', campaignData.prompt_id)
          .single();
        
        promptData = prompt;
      }

      return {
        ...campaignData,
        prompts: promptData
      };
    },
  });

  const { data: callLogs, isLoading: callLogsLoading } = useQuery({
    queryKey: ["call-logs", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'initiated':
      case 'ringing':
        return <Badge variant="default" className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Berlangsung</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-green-500"><Phone className="h-3 w-3 mr-1" />Panggilan Aktif</Badge>;
      case 'ended':
      case 'completed':
        return <Badge variant="default" className="bg-gray-500"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Gagal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderRecordingButton = (log: any) => {
    const recordingUrl = (log?.metadata as any)?.recording_url ||
      log?.end_of_call_report?.call?.recording?.url ||
      log?.end_of_call_report?.recording_url ||
      (log?.metadata as any)?.recordingUrl;

    if (!recordingUrl) return <span className="text-muted-foreground">Tiada rakaman</span>;

    return (
      <AudioPlayerDialog
        recordingUrl={recordingUrl}
        triggerButton={
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Main
          </Button>
        }
      />
    );
  };

  const renderTranscriptDialog = (transcript?: string) => {
    if (!transcript) return <span className="text-muted-foreground">Tiada transkrip</span>;
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Lihat
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transkrip Panggilan</DialogTitle>
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
    if (!summary) return <span className="text-muted-foreground">Tiada ringkasan</span>;
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Lihat
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ringkasan AI</DialogTitle>
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

  if (campaignLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Memuat detail kempen...</p>
        </CardContent>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Kempen tidak dijumpai.</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </CardContent>
      </Card>
    );
  }

  const successRate = campaign.total_numbers > 0 
    ? ((campaign.successful_calls || 0) / campaign.total_numbers * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <CardTitle>{campaign.campaign_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Dicipta pada {new Date(campaign.created_at).toLocaleDateString('ms-MY', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <Badge variant={campaign.status === 'completed' ? 'default' : 'secondary'}>
              {campaign.status === 'completed' ? 'Selesai' : 
               campaign.status === 'in_progress' ? 'Sedang Berjalan' : 
               'Menunggu'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Nombor</p>
                <p className="text-2xl font-bold">{campaign.total_numbers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Berjaya</p>
                <p className="text-2xl font-bold text-green-600">{campaign.successful_calls || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Gagal</p>
                <p className="text-2xl font-bold text-red-600">{campaign.failed_calls || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Kadar Kejayaan</p>
                <p className="text-2xl font-bold text-purple-600">{successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prompt Details */}
      {campaign.prompts && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Prompt Yang Digunakan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Nama Prompt:</p>
                <p className="text-sm text-muted-foreground">{campaign.prompts.prompt_name}</p>
              </div>
              <div>
                <p className="font-medium">Mesej Pertama:</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{campaign.prompts.first_message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Log Panggilan Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {callLogsLoading ? (
            <div className="text-center py-8">
              <p>Memuat log panggilan...</p>
            </div>
          ) : !callLogs || callLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tiada log panggilan dijumpai untuk kempen ini.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Telefon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Rakaman</TableHead>
                  <TableHead>Transkrip</TableHead>
                  <TableHead>Ringkasan AI</TableHead>
                  <TableHead>Kos</TableHead>
                  <TableHead>Masa Mula</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.phone_number || log.caller_number}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell>
                      {log.duration ? `${Math.floor(log.duration / 60)}m ${log.duration % 60}s` : '-'}
                    </TableCell>
                    <TableCell>
                      {renderRecordingButton(log)}
                    </TableCell>
                    <TableCell>
                      {renderTranscriptDialog((log.metadata as any)?.transcript)}
                    </TableCell>
                    <TableCell>
                      {renderSummaryDialog((log.metadata as any)?.summary)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {(log.metadata as any)?.call_cost ? `$${((log.metadata as any).call_cost).toFixed(4)}` : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.start_time ? new Date(log.start_time).toLocaleString('ms-MY') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}