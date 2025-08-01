import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useAppointments = (filters = {}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_unified_calendar_events', {
        professional_user_id_filter: filters.professionalId === 'todos' ? null : filters.professionalId,
      });

      if (error) throw error;

      let filteredEvents = data || [];
      if (filters.status && filters.status !== 'todos') {
        filteredEvents = filteredEvents.filter(event => event.status === filters.status);
      }

      setAppointments(filteredEvents);
    } catch (err) {
      console.error("Error fetching unified events:", err);
      setError(err.message);
      toast({
        title: 'Erro ao carregar agendamentos',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters.professionalId, filters.status, toast]);

  useEffect(() => {
    fetchAppointments();

    const channel = supabase
      .channel('public:appointments_and_surgeries_unified_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchAppointments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surgery_schedule' }, fetchAppointments)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAppointments]);

  const createAppointment = async (appointmentData) => {
    try {
      const { professional_id, start_time, end_time } = appointmentData;
      
      const { data: conflict, error: conflictError } = await supabase.rpc('check_appointment_conflict', {
        p_professional_id: professional_id,
        p_start_time: start_time,
        p_end_time: end_time,
      });

      if (conflictError) throw conflictError;
      if (conflict) {
        toast({
          title: 'Conflito de Horário',
          description: 'Já existe uma consulta ou cirurgia agendada para este profissional neste horário.',
          variant: 'destructive',
        });
        return { success: false, error: 'Conflict' };
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert({ ...appointmentData, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Agendamento Criado!', description: 'A consulta foi agendada com sucesso.', variant: 'success' });
      fetchAppointments();
      return { success: true, data };
    } catch (err) {
      console.error("Error creating appointment:", err);
      toast({ title: 'Erro ao criar agendamento', description: err.message, variant: 'destructive' });
      return { success: false, error: err.message };
    }
  };

  const updateAppointment = async (id, appointmentData) => {
    try {
      const { professional_id, start_time, end_time } = appointmentData;

      const { data: conflict, error: conflictError } = await supabase.rpc('check_appointment_conflict', {
        p_professional_id: professional_id,
        p_start_time: start_time,
        p_end_time: end_time,
        p_exclude_appointment_id: id
      });

      if (conflictError) throw conflictError;
      if (conflict) {
        toast({
          title: 'Conflito de Horário',
          description: 'Já existe uma consulta ou cirurgia agendada para este profissional neste horário.',
          variant: 'destructive',
        });
        return { success: false, error: 'Conflict' };
      }

      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Agendamento Atualizado!', description: 'A consulta foi atualizada com sucesso.', variant: 'success' });
      fetchAppointments();
      return { success: true, data };
    } catch (err) {
      console.error("Error updating appointment:", err);
      toast({ title: 'Erro ao atualizar agendamento', description: err.message, variant: 'destructive' });
      return { success: false, error: err.message };
    }
  };

  const deleteAppointment = async (id) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Agendamento Excluído!', description: 'A consulta foi removida com sucesso.', variant: 'success' });
      fetchAppointments();
      return { success: true };
    } catch (err) {
      console.error("Error deleting appointment:", err);
      toast({ title: 'Erro ao excluir agendamento', description: err.message, variant: 'destructive' });
      return { success: false, error: err.message };
    }
  };

  return { appointments, loading, error, refetchAppointments: fetchAppointments, createAppointment, updateAppointment, deleteAppointment };
};