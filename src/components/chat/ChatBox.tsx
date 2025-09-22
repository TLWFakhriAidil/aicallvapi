import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { MessageList } from './MessageList';

const messageSchema = z.object({
  content: z.string().min(1, 'Mesej tidak boleh kosong')
});

type MessageFormData = z.infer<typeof messageSchema>;

export function ChatBox() {
  const { user } = useCustomAuth();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: ''
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Save user message
      const { error: userError } = await supabase
        .from('messages')
        .insert([{
          user_id: user.id,
          role: 'user',
          content: data.content
        }]);

      if (userError) throw userError;

      // Simulate AI response (replace with actual API call)
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiResponse = `Terima kasih atas mesej anda: "${data.content}". Ini adalah jawapan simulasi dari AI assistant.`;
      
      // Save AI response
      const { error: aiError } = await supabase
        .from('messages')
        .insert([{
          user_id: user.id,
          role: 'assistant',
          content: aiResponse
        }]);

      if (aiError) throw aiError;
      setIsTyping(false);
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['messages', user?.id] });
      toast.success('Mesej berjaya dihantar!');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      setIsTyping(false);
      toast.error('Ralat semasa menghantar mesej');
    }
  });

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages List */}
        <div className="flex-1 overflow-hidden">
          <MessageList isTyping={isTyping} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        placeholder="Taip mesej anda di sini..."
                        className="min-h-[50px] max-h-[120px] resize-none"
                        onKeyPress={handleKeyPress}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={sendMessageMutation.isPending || !form.watch('content')?.trim()}
                className="self-end"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}