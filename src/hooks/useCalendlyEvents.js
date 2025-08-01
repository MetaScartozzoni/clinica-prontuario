import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { normalizePhoneNumber } from '@/lib/utils'; 
import { fetchCalendlyScheduledEvents } from '@/services/calendlyService';

export const useCalendlyEvents = () => {
  const { toast } = useToast();
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [calendlyEvents, setCalendlyEvents] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const loadCalendlyAppointments = useCallback(async (params = {}) => {
    setIsLoadingAppointments(true);
    setFetchError(null);
    try {
      const now = new Date();
      const futureLimit = new Date();
      futureLimit.setDate(now.getDate() + 30); 

      const defaultParams = {
        min_start_time: now.toISOString(),
        max_start_time: futureLimit.toISOString(),
        sort: 'start_time:asc',
        count: 50,
        ...params,
      };
      
      const events = await fetchCalendlyScheduledEvents(defaultParams);
      
      const appointmentsWithDetails = events.map(event => {
        let inviteeName = 'N/A';
        let inviteeEmail = 'N/A';
        let inviteePhone = null;
        let otherQuestions = [];

        if (event.event_guests && event.event_guests.length > 0) {
          const primaryGuest = event.event_guests[0];
          inviteeName = primaryGuest.name || 'Nome não disponível';
          inviteeEmail = primaryGuest.email || 'Email não disponível';
        } else if (event.event_memberships && event.event_memberships.length > 0) {
          const inviteeMembership = event.event_memberships.find(em => em.user_email);
          if (inviteeMembership) {
            inviteeName = inviteeMembership.user_name || 'Nome não disponível';
            inviteeEmail = inviteeMembership.user_email || 'Email não disponível';
          }
        }
        
        if (event.questions_and_answers) {
          event.questions_and_answers.forEach(qa => {
            if (qa.question.toLowerCase().includes('telefone') || qa.question.toLowerCase().includes('phone')) {
              inviteePhone = normalizePhoneNumber(qa.answer);
            } else {
              otherQuestions.push({ question: qa.question, answer: qa.answer });
            }
          });
        }
        if (!inviteePhone && inviteeEmail && event.questions_and_answers) {
            const emailAnswerAsPhone = event.questions_and_answers.find(qa => qa.answer && qa.answer.includes(inviteeEmail) && qa.question.toLowerCase().includes('phone'));
            if (emailAnswerAsPhone) inviteePhone = normalizePhoneNumber(emailAnswerAsPhone.answer);
        }

        return {
          ...event,
          inviteeName,
          inviteeEmail,
          inviteePhone,
          otherQuestions,
          start_time_local: new Date(event.start_time).toLocaleString(),
          end_time_local: new Date(event.end_time).toLocaleString(),
        };
      });

      setCalendlyEvents(appointmentsWithDetails);
      return appointmentsWithDetails; 
    } catch (err) {
      console.error("Error loading appointments from Calendly:", err);
      setFetchError(err.message || "Falha ao carregar agendamentos do Calendly.");
      toast({
        title: "Erro ao Carregar Agendamentos",
        description: err.message || "Não foi possível buscar os dados do Calendly.",
        variant: "destructive",
      });
      return []; 
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [toast]);

  return { 
    calendlyEvents, 
    setCalendlyEvents,
    isLoadingAppointments, 
    fetchError, 
    loadCalendlyAppointments, 
  };
};