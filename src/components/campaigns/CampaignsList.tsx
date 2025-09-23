import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, BarChart3, Calendar, Users, Phone, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { CampaignDetails } from "./CampaignDetails";

export function CampaignsList() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First get campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Then get prompts for each campaign
      const campaignsWithPrompts = await Promise.all(
        campaignsData.map(async (campaign) => {
          if (campaign.prompt_id) {
            const { data: prompt } = await supabase
              .from('prompts')
              .select('prompt_name')
              .eq('id', campaign.prompt_id)
              .single();
            
            return {
              ...campaign,
              prompts: prompt
            };
          }
          return {
            ...campaign,
            prompts: null
          };
        })
      );

      return campaignsWithPrompts;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500"><Phone className="h-3 w-3 mr-1" />Sedang Berjalan</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Gagal</Badge>;
      default:
        return <Badge variant="outline">Menunggu</Badge>;
    }
  };

  if (selectedCampaignId) {
    return (
      <CampaignDetails 
        campaignId={selectedCampaignId} 
        onBack={() => setSelectedCampaignId(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Senarai Kempen Batch Call
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p>Memuat senarai kempen...</p>
          </div>
        ) : !campaigns || campaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Tiada kempen dijumpai. Mulakan kempen batch call pertama anda.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kempen</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Statistik</TableHead>
                <TableHead>Tarikh</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    {campaign.campaign_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {campaign.prompts?.prompt_name || "Prompt dipadam"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(campaign.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{campaign.total_numbers || 0} total</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          {campaign.successful_calls || 0}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-3 w-3" />
                          {campaign.failed_calls || 0}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(campaign.created_at).toLocaleDateString('ms-MY', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCampaignId(campaign.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}