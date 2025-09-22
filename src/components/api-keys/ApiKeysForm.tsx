import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const apiKeysSchema = z.object({
  vapi_api_key: z.string().min(1, 'Vapi API Key diperlukan'),
  assistant_id: z.string().min(1, 'Assistant ID diperlukan'),
  phone_number_id: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^[\+]?[0-9\-\(\)\s]+$/.test(val);
  }, 'Format nombor telefon tidak sah')
});

type ApiKeysFormData = z.infer<typeof apiKeysSchema>;

interface ApiKeysData {
  id: string;
  vapi_api_key: string;
  assistant_id: string;
  phone_number_id: string | null;
}

export function ApiKeysForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<ApiKeysFormData>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: {
      vapi_api_key: '',
      assistant_id: '',
      phone_number_id: ''
    }
  });

  // Fetch existing API keys
  const { data: apiKeysData, isLoading } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ApiKeysData | null;
    },
    enabled: !!user?.id
  });

  // Auto-populate form when data is loaded
  useEffect(() => {
    if (apiKeysData) {
      form.reset({
        vapi_api_key: apiKeysData.vapi_api_key,
        assistant_id: apiKeysData.assistant_id,
        phone_number_id: apiKeysData.phone_number_id || ''
      });
    }
  }, [apiKeysData, form]);

  // Save/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ApiKeysFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const payload = {
        user_id: user.id,
        vapi_api_key: data.vapi_api_key,
        assistant_id: data.assistant_id,
        phone_number_id: data.phone_number_id || null
      };

      if (apiKeysData?.id) {
        // Update existing
        const { error } = await supabase
          .from('api_keys')
          .update(payload)
          .eq('id', apiKeysData.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('api_keys')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('API Keys berjaya disimpan!');
      queryClient.invalidateQueries({ queryKey: ['api-keys', user?.id] });
    },
    onError: (error) => {
      console.error('Error saving API keys:', error);
      toast.error('Ralat semasa menyimpan API Keys');
    }
  });

  const onSubmit = (data: ApiKeysFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys Settings</CardTitle>
        <CardDescription>
          Urus kunci API anda untuk integrasi dengan perkhidmatan pihak ketiga
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="vapi_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vapi API Key *</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Masukkan Vapi API Key"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assistant_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assistant ID *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Masukkan Assistant ID"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Contoh: +60123456789"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan API Keys'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}