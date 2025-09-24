import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCustomAuth } from "@/contexts/CustomAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Phone, Users, Zap } from "lucide-react";

const batchCallSchema = z.object({
  campaignName: z.string().min(1, "Nama kempen diperlukan"),
  promptId: z.string().min(1, "Sila pilih prompt"),
  phoneNumbers: z.string().min(1, "Senarai nombor telefon diperlukan"),
  concurrentLimit: z.number().min(1).max(50).default(10),
});

type BatchCallFormData = z.infer<typeof batchCallSchema>;

export function BatchCallForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useCustomAuth();

  const form = useForm<BatchCallFormData>({
    resolver: zodResolver(batchCallSchema),
    defaultValues: {
      campaignName: "",
      promptId: "",
      phoneNumbers: "",
      concurrentLimit: 10,
    },
  });

  // Fetch available prompts
  const { data: prompts, isLoading: promptsLoading } = useQuery({
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

  const batchCallMutation = useMutation({
    mutationFn: async (data: BatchCallFormData) => {
      // Parse phone numbers (one per line)
      const phoneNumbers = data.phoneNumbers
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (phoneNumbers.length === 0) {
        throw new Error("Tiada nombor telefon yang sah");
      }

      // Call the batch-call edge function
      const { data: response, error } = await supabase.functions.invoke('batch-call', {
        body: {
          campaignName: data.campaignName,
          promptId: data.promptId,
          phoneNumbers: phoneNumbers,
          concurrentLimit: data.concurrentLimit,
        }
      });

      if (error) throw error;
      return response;
    },
    onSuccess: (response) => {
      toast.success(`Kempen batch call berjaya dimulakan! 
        Berjaya: ${response.summary.successful_calls}, 
        Gagal: ${response.summary.failed_calls}`);
      form.reset();
    },
    onError: (error: any) => {
      toast.error("Gagal memulakan kempen: " + error.message);
    },
  });

  const onSubmit = (data: BatchCallFormData) => {
    setIsSubmitting(true);
    batchCallMutation.mutate(data);
    setIsSubmitting(false);
  };

  // Parse and count phone numbers for preview
  const phoneNumbers = form.watch("phoneNumbers");
  const phoneList = phoneNumbers
    ? phoneNumbers.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Mulakan Kempen Batch Call
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="campaignName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kempen</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: Panggilan Promo VTEC Sept 2025" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promptId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Skrip Prompt</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih skrip untuk kempen ini" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {promptsLoading ? (
                            <SelectItem value="loading" disabled>
                              Memuat prompt...
                            </SelectItem>
                          ) : prompts?.length === 0 ? (
                            <SelectItem value="no-prompts" disabled>
                              Tiada prompt dijumpai. Cipta prompt dahulu.
                            </SelectItem>
                          ) : (
                            prompts?.map((prompt) => (
                              <SelectItem key={prompt.id} value={prompt.id}>
                                {prompt.prompt_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="concurrentLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Had Panggilan Serentak</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={50}
                        placeholder="10"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 10)}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Maksimum 50 panggilan serentak. Disyorkan: 5-15 untuk prestasi terbaik.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Senarai Nombor Telefon
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Masukkan satu nombor telefon setiap baris:
601137527311
0123456789
+60123456789"
                        className="min-h-[200px] font-mono text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {phoneList.length} nombor dikesan
                      </span>
                      {phoneList.length > 0 && (
                        <span>
                          Anggaran masa: ~{Math.ceil(phoneList.length / (form.watch("concurrentLimit") || 10)) * 2} minit
                        </span>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting || batchCallMutation.isPending || !prompts || prompts.length === 0}
                className="w-full"
                size="lg"
              >
                {isSubmitting || batchCallMutation.isPending ? (
                  "Memulakan Kempen..."
                ) : (
                  `Mulakan Batch Call (${phoneList.length} nombor)`
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {phoneList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pratonton Nombor Telefon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                {phoneList.slice(0, 50).map((number, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-center">
                    {number}
                  </div>
                ))}
                {phoneList.length > 50 && (
                  <div className="p-2 text-muted-foreground text-center col-span-full">
                    ... dan {phoneList.length - 50} nombor lagi
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}