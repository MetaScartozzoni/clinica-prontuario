import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const usePatientSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const syncMultipleEventsWithDb = useCallback(async (events) => {
    setIsSyncing(true);
    let successCount = 0;
    let errorCount = 0;
    const updatedAppointments = [...events];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const payload = {
          uri: event.uri,
          inviteeName: event.inviteeName,
          inviteeEmail: event.inviteeEmail,
          inviteePhone: event.inviteePhone,
          name: event.name,
          start_time: event.start_time,
          end_time: event.end_time,
          location: event.location,
          questions_and_answers: event.questions_and_answers || [],
          invitees: []
      };

      if (event.event_guests && event.event_guests.length > 0) {
        payload.invitees = [{ uri: event.event_guests[0].uri }];
      } else if (event.event_memberships && event.event_memberships.length > 0) {
        const invitee = event.event_memberships.find(em => em.user);
        if (invitee) {
          payload.invitees = [{ uri: invitee.user }];
        }
      }

      const { data, error } = await supabase.rpc('sync_calendly_event_to_patient', { event_payload: payload });

      if (error || (data && data[0].sync_status === 'error')) {
        errorCount++;
        const errorMessage = error?.message || data?.[0]?.error_message || "Erro desconhecido ao sincronizar.";
        console.error(`Erro ao sincronizar evento ${event.uri}:`, errorMessage);
        updatedAppointments[i] = { ...updatedAppointments[i], syncStatus: 'error', syncMessage: errorMessage };
      } else if (data && data[0].sync_status === 'success') {
        successCount++;
        updatedAppointments[i] = { ...updatedAppointments[i], syncStatus: 'success', patientId: data[0].patient_id, isNew: data[0].is_new };
      }
    }

    if (events.length > 0) {
        toast({
          title: "Sincronização Concluída",
          description: `${successCount} agendamentos sincronizados com sucesso. ${errorCount} falharam.`,
          variant: errorCount > 0 ? "destructive" : "success",
        });
    }

    setIsSyncing(false);
    return { updatedAppointments, successCount, errorCount };
  }, [toast]);

  return { isSyncing, syncMultipleEventsWithDb };
};