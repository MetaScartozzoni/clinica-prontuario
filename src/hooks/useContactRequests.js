import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import useAuthRole from './useAuthRole';

const useContactRequests = () => {
  const { toast } = useToast();
  const { userId } = useAuthRole();
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      let query = supabase
        .from('contact_requests')
        .select(`
          *,
          patient:patient_id (id, name, loyalty_level),
          doctor:doctor_id (id, full_name),
          creator:created_by (id, full_name)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (filters.status && filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast({
        title: 'Erro ao buscar solicitações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchRelatedData = useCallback(async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        supabase.from('patients').select('id, name, loyalty_level').order('name'),
        supabase.from('profiles').select('id, full_name').eq('app_role', 'medico').order('full_name')
      ]);

      if (patientsRes.error) throw patientsRes.error;
      setPatients(patientsRes.data || []);

      if (doctorsRes.error) throw doctorsRes.error;
      setDoctors(doctorsRes.data || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados de apoio',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
    fetchRelatedData();
  }, [fetchRequests, fetchRelatedData]);

  const addRequest = async (requestData) => {
    try {
      const payload = { ...requestData, created_by: userId };
      const { data, error } = await supabase.from('contact_requests').insert(payload).select().single();
      if (error) throw error;
      
      await supabase.rpc('log_audit_trail', {
        p_action: 'contact_request_created',
        p_details: { requestId: data.id, patientId: data.patient_id }
      });

      toast({ title: 'Sucesso', description: 'Solicitação criada e aguardando aprovação.', variant: 'success' });
      fetchRequests();
      return { success: true, data };
    } catch (error) {
      toast({ title: 'Erro ao criar solicitação', description: error.message, variant: 'destructive' });
      return { success: false };
    }
  };

  const updateRequestStatus = async (requestId, status, denial_reason = null) => {
    try {
      const updatePayload = { status, updated_at: new Date().toISOString() };
      if (denial_reason) {
        updatePayload.denial_reason = denial_reason;
      }

      const { data, error } = await supabase.from('contact_requests').update(updatePayload).eq('id', requestId).select().single();
      if (error) throw error;

      await supabase.rpc('log_audit_trail', {
        p_action: 'contact_request_status_updated',
        p_details: { requestId, newStatus: status }
      });

      toast({ title: 'Status Atualizado', description: `Solicitação movida para ${status}.`, variant: 'success' });
      fetchRequests();
      return { success: true, data };
    } catch (error) {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' });
      return { success: false };
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const { error } = await supabase.from('contact_requests').delete().eq('id', requestId);
      if (error) throw error;
      
      await supabase.rpc('log_audit_trail', {
        p_action: 'contact_request_deleted',
        p_details: { requestId }
      });

      toast({ title: 'Sucesso', description: 'Solicitação excluída.', variant: 'success' });
      fetchRequests();
      return { success: true };
    } catch (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return { success: false };
    }
  };

  return {
    requests,
    patients,
    doctors,
    loading,
    fetchRequests,
    addRequest,
    updateRequestStatus,
    deleteRequest,
  };
};

export default useContactRequests;