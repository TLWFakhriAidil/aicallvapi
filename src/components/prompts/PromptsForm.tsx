import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { X } from "lucide-react";

const promptSchema = z.object({
  prompt_name: z.string().min(1, "Nama prompt diperlukan"),
  first_message: z.string().min(1, "Mesej pertama diperlukan"),
  system_prompt: z.string().min(10, "Skrip sistem diperlukan (minimum 10 karakter)"),
});

type PromptFormData = z.infer<typeof promptSchema>;

interface PromptsFormProps {
  prompt?: any;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function PromptsForm({ prompt, onClose, onSuccess }: PromptsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useCustomAuth();
  const queryClient = useQueryClient();

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt_name: prompt?.prompt_name || "",
      first_message: prompt?.first_message || "",
      system_prompt: prompt?.system_prompt || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PromptFormData) => {
      if (!user) throw new Error("User not authenticated");

      if (prompt?.id) {
        // Update existing prompt
        const { error } = await supabase
          .from('prompts')
          .update({
            prompt_name: data.prompt_name,
            first_message: data.first_message,
            system_prompt: data.system_prompt,
          })
          .eq('id', prompt.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new prompt
        const { error } = await supabase
          .from('prompts')
          .insert({
            user_id: user.id,
            prompt_name: data.prompt_name,
            first_message: data.first_message,
            system_prompt: data.system_prompt,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(prompt?.id ? "Prompt berjaya dikemaskini!" : "Prompt berjaya dicipta!");
      queryClient.invalidateQueries({ queryKey: ["prompts", user?.id] });
      onSuccess?.();
      onClose?.();
    },
    onError: (error: any) => {
      toast.error("Gagal menyimpan prompt: " + error.message);
    },
  });

  const onSubmit = (data: PromptFormData) => {
    setIsLoading(true);
    mutation.mutate(data);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{prompt?.id ? "Edit Prompt" : "Cipta Prompt Baru"}</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Prompt</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Contoh: Skrip Jualan VTEC Promo" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="first_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesej Pertama</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Contoh: Assalamualaikum, ni {{CUSTOMER_NAME}} kan?"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="system_prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skrip Sistem (System Prompt)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Masukkan keseluruhan skrip panggilan anda di sini..."
                      className="min-h-[400px] font-mono text-sm"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading || mutation.isPending}
                className="flex-1"
              >
                {isLoading || mutation.isPending ? "Menyimpan..." : "Simpan Prompt"}
              </Button>
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}