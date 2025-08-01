import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { updatePatientJourneyDeadlinesAfterAcceptance } from '@/lib/budgetUtils.js';

export const useQuotesManagement = () => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [surgeryTypes, setSurgeryTypes] = useState([]);
  
  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          patients (id, name, email, phone, lead_classification),
          surgery_types (id, name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      const mappedData = data.map(q => ({
        ...q,
        patient_name: q.patients?.name || q.patient_name, 
        surgery_name: q.surgery_types?.name || q.custom_surgery_name,
        patient_phone: q.patients?.phone || q.patient_phone,
        patient_email: q.patients?.email || q.patient_email,
        lead_classification: q.patients?.lead_classification || q.lead_classification,
      }));
      setQuotes(mappedData || []);

    } catch (error) {
      toast({ title: "Erro ao buscar orçamentos", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const fetchSurgeryTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('surgery_types').select('id, name').order('name');
      if (error) throw error;
      setSurgeryTypes(data || []);
    } catch (error) {
      toast({ title: "Erro ao buscar tipos de cirurgia", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchQuotes();
    fetchSurgeryTypes();
  }, [fetchQuotes, fetchSurgeryTypes]);

  const deleteQuote = async (quoteId) => {
    if (!window.confirm("Tem certeza que deseja excluir este orçamento?")) return false;
    try {
      await supabase.from('quote_items').delete().eq('quote_id', quoteId);
      const { error } = await supabase.from('quotes').delete().eq('id', quoteId);
      if (error) throw error;
      
      toast({ title: "Orçamento Excluído", description: "O orçamento foi removido com sucesso.", variant: "success" });
      fetchQuotes(); 
      return true;
    } catch (error) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
      return false;
    }
  };

  const updateQuoteStatus = async (quote, newStatus, extraData = {}) => {
    try {
      const updates = { 
        status: newStatus, 
        updated_at: new Date().toISOString(),
        ...extraData 
      };

      if (newStatus === 'Aceito') {
        updates.accepted_at = new Date().toISOString();
        updates.payment_status = 'Pendente';
        updates.payment_link = `https://buy.stripe.com/placeholder_for_${quote.id}`; 
      } else if (newStatus === 'Em Negociação') {
        updates.negotiation_started_at = new Date().toISOString();
      } else if (newStatus === 'Recusado') {
          updates.refused_at = new Date().toISOString();
      }

      const { data: updatedQuote, error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', quote.id)
        .select()
        .single();
      
      if(error) throw error;
      
      if (newStatus === 'Aceito' && extraData.proposed_surgery_date && quote.patient_id) {
        toast({ title: "Link de Pagamento Gerado!", description: `Link de pagamento simulado enviado para ${quote.patient_name}.`, variant: "info" });
      }

      toast({ title: "Status Atualizado!", description: `Status do orçamento alterado para ${newStatus}.`, variant: "success" });
      fetchQuotes();
      return true;
    } catch (error) {
      toast({ title: "Erro ao Atualizar Status", description: error.message, variant: "destructive" });
      return false;
    }
  };

  return {
    quotes,
    isLoading,
    surgeryTypes,
    fetchQuotes,
    deleteQuote,
    updateQuoteStatus,
  };
};