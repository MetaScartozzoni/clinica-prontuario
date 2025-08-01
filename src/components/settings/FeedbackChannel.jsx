import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

const FeedbackChannel = () => {
  const [feedbackType, setFeedbackType] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackType || !content) {
      toast({ title: "Campos obrigatórios", description: "Por favor, selecione um tipo e escreva sua mensagem.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{
          user_id: session.user.id,
          feedback_type: feedbackType,
          content: content,
        }]);
      
      if (error) throw error;
      
      toast({ title: "Feedback Enviado!", description: "Obrigado por sua contribuição!", variant: "success" });
      setFeedbackType('');
      setContent('');
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      toast({ title: "Erro ao Enviar", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare /> Canal de Feedback
        </CardTitle>
        <CardDescription>Envie sugestões de melhoria, reporte problemas ou compartilhe sua opinião sobre o sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={feedbackType} onValueChange={setFeedbackType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de feedback..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sugestao">Sugestão de Melhoria</SelectItem>
              <SelectItem value="bug">Reportar um Problema</SelectItem>
              <SelectItem value="opiniao">Opinião Geral</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Escreva sua mensagem aqui..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
          />
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Enviar Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackChannel;