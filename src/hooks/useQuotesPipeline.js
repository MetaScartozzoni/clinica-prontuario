import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useQuotesPipeline = () => {
  const { toast } = useToast();
  const [quotesByStatus, setQuotesByStatus] = useState({
    'Enviado': [],
    'Visualizado': [],
    'Em Negociação': [],
    'Aceito': [],
    'Pago': [],
    'Recusado': []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          patient_name,
          custom_surgery_name,
          procedure_name,
          total_value,
          status,
          viewed_at,
          created_at,
          updated_at,
          patients (name, email, phone)
        `)
        .in('status', ['Enviado', 'Visualizado', 'Em Negociação', 'Aceito', 'Pago', 'Recusado']);
      
      if (error) throw error;
      
      const categorizedQuotes = {
        'Enviado': [],
        'Visualizado': [],
        'Em Negociação': [],
        'Aceito': [],
        'Pago': [],
        'Recusado': []
      };

      data.forEach(quote => {
        let status = quote.status;
        if (status === 'Enviado' && quote.viewed_at) {
          status = 'Visualizado'; 
        }
        
        if (categorizedQuotes[status]) {
          const finalQuote = {
            ...quote,
            patient_name: quote.patients?.name || quote.patient_name,
            surgery_name: quote.custom_surgery_name || quote.procedure_name
          };
          categorizedQuotes[status].push(finalQuote);
        }
      });

      setQuotesByStatus(categorizedQuotes);
    } catch (error) {
      toast({ title: "Erro ao buscar orçamentos para o pipeline", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const updateQuoteStatusInPipeline = async (quoteId, oldStatus, newStatus) => {
    setQuotesByStatus(prev => {
        const sourceColumn = [...prev[oldStatus]];
        const destColumn = [...prev[newStatus]];
        const quoteIndex = sourceColumn.findIndex(q => q.id === quoteId);
        if(quoteIndex === -1) return prev;

        const [movedQuote] = sourceColumn.splice(quoteIndex, 1);
        movedQuote.status = newStatus;
        destColumn.push(movedQuote);

        return {
            ...prev,
            [oldStatus]: sourceColumn,
            [newStatus]: destColumn,
        };
    });
    
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', quoteId);
      
      if (error) throw error;
      
      toast({ title: "Status Atualizado!", description: "O orçamento foi movido no pipeline.", variant: "success" });
      fetchQuotes();
    } catch (error) {
       toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
       fetchQuotes(); // Re-fetch to revert optimistic update on error
    }
  };


  return { quotesByStatus, isLoading, fetchQuotes, updateQuoteStatusInPipeline };
};