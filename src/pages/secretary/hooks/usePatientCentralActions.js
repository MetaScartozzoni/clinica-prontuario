import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useProfile } from '@/contexts/ProfileContext';

export const usePatientCentralActions = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [unresolvedRequests, setUnresolvedRequests] = useState([]);

  const searchPatient = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchedPatient(null);
      setUnresolvedRequests([]);
      return null;
    }

    setIsLoading(true);
    try {
      let query = supabase.from('patients').select('id, full_name, email, phone, cpf');
      if (/^\d{11}$/.test(term)) {
        query = query.eq('cpf', term);
      } else {
        query = query.ilike('full_name', `%${term}%`);
      }
      
      const { data, error } = await query.limit(1).single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSearchedPatient(data);
        fetchUnresolvedRequests(data.id);
        return data;
      } else {
        setSearchedPatient(null);
        setUnresolvedRequests([]);
        return null;
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao buscar paciente", description: error.message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchUnresolvedRequests = useCallback(async (patientId) => {
    if (!patientId) {
      setUnresolvedRequests([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .select('id, content, created_at, status')
        .eq('patient_id', patientId)
        .neq('status', 'Resolvida')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUnresolvedRequests(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao buscar solicitações", description: error.message });
    }
  }, [toast]);

  const handleCreatePatient = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_patient_and_profile', {
        p_patient_data: {
          first_name: formData.patient_name_manual.split(' ')[0],
          last_name: formData.patient_name_manual.split(' ').slice(1).join(' '),
          phone: formData.patient_contact_manual,
          email: formData.patient_email,
          cpf: formData.patient_cpf,
          created_by: profile.id
        },
      });

      if (error) throw error;

      const { patient_id, full_name, is_new } = data[0];
      setSearchedPatient({ id: patient_id, full_name: full_name, phone: formData.patient_contact_manual, email: formData.patient_email, cpf: formData.patient_cpf });
      toast({ title: "✅ Sucesso!", description: `Paciente ${full_name} ${is_new ? 'criado' : 'encontrado'} com sucesso!` });
      return { patient_id, full_name, is_new };
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao criar/buscar paciente", description: error.message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [profile, toast]);

  return {
    isLoading,
    searchedPatient,
    setSearchedPatient,
    unresolvedRequests,
    searchPatient,
    handleCreatePatient,
    fetchUnresolvedRequests,
  };
};