import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import useAuthRole from './useAuthRole';

const useFinancialCalendar = () => {
  const { toast } = useToast();
  const { userId } = useAuthRole();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      let query = supabase.from('financial_transactions').select('*');

      if (filters.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }
      if (filters.category && filters.category !== 'todos') {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedEvents = data.map(event => ({
        ...event,
        id: event.id,
        title: `${event.description || 'Transação'}`,
        start: new Date(event.due_date || event.transaction_date),
        end: new Date(event.due_date || event.transaction_date),
        allDay: true,
        resource: event, 
      }));
      setTransactions(formattedEvents);
    } catch (error) {
      toast({
        title: 'Erro ao buscar transações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addOrUpdateTransaction = async (eventData) => {
    try {
      const { id, ...dataToSave } = eventData;
      
      const transactionPayload = {
        transaction_date: dataToSave.transaction_date,
        payment_date: dataToSave.payment_date,
        due_date: dataToSave.due_date,
        transaction_type: dataToSave.transaction_type,
        amount: parseFloat(dataToSave.amount),
        category: dataToSave.category,
        description: dataToSave.description,
        notes: dataToSave.notes,
        status: dataToSave.status,
        responsible_user_id: userId,
        patient_name: dataToSave.patient_name,
        related_entity_type: dataToSave.related_entity_type,
        discount: parseFloat(dataToSave.discount || 0),
        commission: parseFloat(dataToSave.commission || 0),
        installments: parseInt(dataToSave.installments, 10) || null,
      };

      if (id) {
        const { error } = await supabase.from('financial_transactions').update(transactionPayload).eq('id', id);
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Transação atualizada.', variant: 'success' });
      } else {
        const { error } = await supabase.from('financial_transactions').insert(transactionPayload);
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Transação criada.', variant: 'success' });
      }
      fetchTransactions();
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao salvar transação',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTransaction = async (eventId) => {
    try {
      const { error } = await supabase.from('financial_transactions').delete().eq('id', eventId);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Transação excluída.', variant: 'success' });
      fetchTransactions();
      return true;
    } catch (error) {
      toast({
        title: 'Erro ao excluir transação',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    transactions,
    loading,
    fetchTransactions,
    addOrUpdateTransaction,
    deleteTransaction,
  };
};

export default useFinancialCalendar;