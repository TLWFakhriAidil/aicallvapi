import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { PromptsForm } from "./PromptsForm";

export function PromptsList() {
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useCustomAuth();
  const queryClient = useQueryClient();

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["prompts", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (promptId: string) => {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Prompt berjaya dipadam!");
      queryClient.invalidateQueries({ queryKey: ["prompts", user?.id] });
    },
    onError: (error: any) => {
      toast.error("Gagal memadam prompt: " + error.message);
    },
  });

  const handleEdit = (prompt: any) => {
    setSelectedPrompt(prompt);
    setShowForm(true);
  };

  const handleDelete = (prompt: any) => {
    if (confirm(`Adakah anda pasti mahu memadam prompt "${prompt.prompt_name}"?`)) {
      deleteMutation.mutate(prompt.id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPrompt(null);
  };

  if (showForm) {
    return (
      <PromptsForm
        prompt={selectedPrompt}
        onClose={handleCloseForm}
        onSuccess={handleCloseForm}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Senarai Prompt Skrip</CardTitle>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Cipta Prompt Baru
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p>Memuat senarai prompt...</p>
          </div>
        ) : !prompts || prompts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Tiada prompt dijumpai. Cipta prompt pertama anda untuk memulakan kempen panggilan.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cipta Prompt Pertama
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Prompt</TableHead>
                <TableHead>Mesej Pertama</TableHead>
                <TableHead>Tarikh Dicipta</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell className="font-medium">
                    {prompt.prompt_name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {prompt.first_message}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {new Date(prompt.created_at).toLocaleDateString('ms-MY')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(prompt)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(prompt)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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