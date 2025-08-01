import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useChat = (contextId, contextType = 'budget') => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!contextId) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from('negotiation_messages')
        .select('*, sender:sender_id(user_metadata)')
        .order('sent_at', { ascending: true });

      if (contextType === 'budget') {
        query = query.eq('budget_id', contextId);
      } else if (contextType === 'patient') {
        query = query.eq('patient_id', contextId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({ title: "Erro ao buscar mensagens", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [contextId, contextType, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async ({ content, senderId, senderType, patientId, budgetId, channel, context, attachment }) => {
    if (!content && !attachment) return;
    setIsSending(true);
    try {
      const messageData = {
        message_content: content,
        sender_id: senderId,
        sender_type: senderType,
        patient_id: patientId,
        budget_id: budgetId,
        channel: channel,
        context: context,
        status: 'sent',
        type: attachment ? 'file' : 'message',
        attachment_url: attachment?.url,
        attachment_name: attachment?.name,
      };

      const { data: insertedMessage, error } = await supabase.from('negotiation_messages').insert(messageData).select().single();
      if (error) throw error;

      if (attachment) {
         await supabase.from('patient_documents').insert({
          patient_id: patientId,
          file_name: attachment.name,
          file_url: attachment.url,
          document_type: senderType === 'clinic' ? 'Anexo de Chat' : 'Anexo de Chat (Paciente)',
          description: `Anexo enviado na conversa.`,
          uploaded_by: senderId,
          message_id: insertedMessage.id,
          attachment_type: 'chat_attachment'
        });
      }

      await supabase.rpc('log_audit_trail', { 
        p_action: senderType === 'clinic' ? 'message_sent' : 'patient_message_sent', 
        p_details: { patient_id: patientId, budget_id: budgetId, channel: channel } 
      });

      fetchMessages();
      toast({ title: "Mensagem enviada!", variant: "success" });
      return true;
    } catch (error) {
      toast({ title: "Erro ao enviar mensagem", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    fetchMessages,
    sendMessage,
  };
};