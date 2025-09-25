import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { VapiClient } from '@/lib/vapiClient';
import { Badge } from '@/components/ui/badge';

// Schema for form validation
const apiKeysSchema = z.object({
  vapi_api_key: z.string().min(1, 'VAPI API Key is required'),
});

type ApiKeysFormData = z.infer<typeof apiKeysSchema>;

interface ApiKeysData {
  id: string;
  vapi_api_key: string;
  status: string;
}

export function ApiKeysForm() {
  const { user } = useCustomAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm<ApiKeysFormData>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: {
      vapi_api_key: '',
    },
  });

  // Fetch existing API keys
  const { data, isLoading } = useQuery({
    queryKey: ['api-keys', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ApiKeysData | null;
    },
    enabled: !!user,
  });

  // Auto-populate form when data is loaded
  useEffect(() => {
    if (data) {
      form.reset({
        vapi_api_key: data.vapi_api_key,
      });
    }
  }, [data, form]);

  // Mutation for saving API keys
  const saveMutation = useMutation({
    mutationFn: async (data: ApiKeysFormData) => {
      if (!user) throw new Error('User not authenticated');

      // Check if user already has API keys
      const { data: existingKeys } = await supabase
        .from('api_keys')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const apiKeyData = {
        vapi_api_key: data.vapi_api_key,
        assistant_id: '',
        phone_number_id: '',
        status: 'connected',
        updated_at: new Date().toISOString()
      };

      if (existingKeys) {
        // Update existing keys
        const { error } = await supabase
          .from('api_keys')
          .update(apiKeyData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new keys
        const { error } = await supabase
          .from('api_keys')
          .insert({
            user_id: user.id,
            ...apiKeyData
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'API key saved successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['api-keys', user?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
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
        <CardTitle className="flex items-center justify-between">
          API Keys Configuration
          {data?.status === 'connected' ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="w-3 h-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Configure your VAPI API key for batch calling.
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
                  <FormLabel>VAPI API Key</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Enter your VAPI API key" />
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
                  Saving...
                </>
              ) : (
                'Save API Key'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}