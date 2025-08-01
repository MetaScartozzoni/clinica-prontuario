import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { normalizePhoneNumber } from '@/lib/utils';

export const useNegotiations = (initialStatusFilter = 'Em Negociação') => {
  const { toast } = useToast();
  const [negotiations, setNegotiations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const fetchNegotiations = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('budgets').select(`
        *,
        patients (id, name, email, phone, lead_classification),
        surgery_types (id, name)
      `);

      if (statusFilter !== 'Todos') {
        query = query.eq('status', statusFilter);
      }
      
      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      let filteredData = data.map(n => ({
        ...n,
        patient_name: n.patients?.name || n.patient_name,
        patient_phone: n.patients?.phone || n.patient_phone,
        surgery_name: n.surgery_types?.name || n.surgery_name,
      }));

      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const normalizedPhoneSearch = normalizePhoneNumber(searchTerm);
        filteredData = filteredData.filter(n => 
          n.id.toLowerCase().includes(lowerSearchTerm) ||
          (n.patient_name || '').toLowerCase().includes(lowerSearchTerm) ||
          (n.patient_phone && normalizedPhoneSearch && n.patient_phone.includes(normalizedPhoneSearch))
        );
      }
      setNegotiations(filteredData);

    } catch (error) {
      toast({ title: "Erro ao buscar negociações", description: error.message, variant: "destructive" });
      setNegotiations([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm, toast]);

  useEffect(() => {
    fetchNegotiations();
  }, [fetchNegotiations]);

  return {
    negotiations,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentUser,
    refreshNegotiations: fetchNegotiations,
  };
};