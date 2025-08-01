import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useSurgeries = () => {
  const { toast } = useToast();
  const { user } = useAuth(); // Obter o usuário logado
  const [surgeries, setSurgeries] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSurgeries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_surgeries_list');
      if (error) throw error;
      setSurgeries(data || []);
    } catch (err) {
      console.error("Error fetching surgeries:", err);
      setError(err.message);
      toast({
        title: 'Erro ao carregar cirurgias',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchJourneys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_patient_journeys');
      if (error) throw error;
      setJourneys(data || []);
    } catch (err) {
      console.error("Error fetching patient journeys:", err);
      setError(err.message);
      toast({
        title: 'Erro ao carregar jornadas dos pacientes',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refetchAll = useCallback(() => {
    fetchSurgeries();
    fetchJourneys();
  }, [fetchSurgeries, fetchJourneys]);

  useEffect(() => {
    refetchAll();

    const surgeryChannel = supabase
      .channel('public:surgery_schedule')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surgery_schedule' }, (payload) => {
        // Ignora DELETE para evitar inconsistências temporárias e confia no refetchAll
        if (payload.eventType !== 'DELETE') { 
          refetchAll();
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'surgery_schedule' }, (payload) => {
        // For DELETE events, update state immediately to remove the item
        setSurgeries(prev => prev.filter(s => s.id !== payload.old.id));
        setJourneys(prev => prev.filter(j => j.surgery_schedule_id !== payload.old.id));
        toast({
          title: 'Cirurgia Excluída!',
          description: 'A cirurgia foi removida com sucesso.',
          variant: 'success',
        });
      })
      .subscribe();
      
    const journeyChannel = supabase
      .channel('public:patient_journey_progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_journey_progress' }, refetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(surgeryChannel);
      supabase.removeChannel(journeyChannel);
    };
  }, [refetchAll, toast]);

  const createSurgery = useCallback(async (surgeryData) => {
    if (!user) {
      toast({ title: 'Erro de autenticação', description: 'Usuário não logado.', variant: 'destructive' });
      return { success: false, error: 'User not logged in' };
    }

    try {
      const { professional_id, scheduled_date_time, duration_minutes } = surgeryData;

      const start_time = new Date(scheduled_date_time).toISOString();
      const end_time = new Date(new Date(scheduled_date_time).getTime() + duration_minutes * 60000).toISOString();

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
        .from('surgery_schedule')
        .insert({
          ...surgeryData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Cirurgia Criada!', description: 'A cirurgia foi agendada com sucesso.', variant: 'success' });
      // refetchAll é chamado pelo Realtime Listener
      return { success: true, data };
    } catch (err) {
      console.error("Error creating surgery:", err);
      toast({ title: 'Erro ao criar cirurgia', description: err.message, variant: 'destructive' });
      return { success: false, error: err.message };
    }
  }, [user, toast]);

  const updateSurgery = useCallback(async (id, surgeryData) => {
    try {
      const { professional_id, scheduled_date_time, duration_minutes } = surgeryData;

      const start_time = new Date(scheduled_date_time).toISOString();
      const end_time = new Date(new Date(scheduled_date_time).getTime() + duration_minutes * 60000).toISOString();

      const { data: conflict, error: conflictError } = await supabase.rpc('check_appointment_conflict', {
        p_professional_id: professional_id,
        p_start_time: start_time,
        p_end_time: end_time,
        p_exclude_surgery_id: id
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
        .from('surgery_schedule')
        .update(surgeryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Cirurgia Atualizada!', description: 'As informações da cirurgia foram salvas.', variant: 'success' });
      // refetchAll é chamado pelo Realtime Listener
      return { success: true, data };
    } catch (err) {
      console.error("Error updating surgery:", err);
      toast({ title: 'Erro ao atualizar cirurgia', description: err.message, variant: 'destructive' });
      return { success: false, error: err.message };
    }
  }, [toast]);

  const deleteSurgery = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('surgery_schedule')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Realtime listener will handle the UI update via a specific DELETE event handler
      return { success: true };
    } catch (err) {
      console.error("Error deleting surgery:", err);
      toast({ title: 'Erro ao excluir cirurgia', description: err.message, variant: 'destructive' });
      return { success: false, error: err.message };
    }
  }, [toast]);

  return {
    surgeries,
    journeys,
    isLoading,
    error,
    refetchAll,
    createSurgery,
    updateSurgery,
    deleteSurgery,
  };
};