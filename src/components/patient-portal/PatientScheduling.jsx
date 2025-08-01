import React, { useState, useEffect, useCallback } from 'react';
    import { Calendar } from '@/components/ui/calendar';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Loader2, CalendarCheck, AlertTriangle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useProfile } from '@/contexts/ProfileContext';
    import { supabase } from '@/lib/supabaseClient';
    import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
    import { ptBR } from 'date-fns/locale';
    import OnlineMeetingModal from '@/components/general/OnlineMeetingModal';
    import { useWhereby } from '@/contexts/WherebyContext';

    const PatientScheduling = ({ patientId }) => {
      const { toast } = useToast();
      const { profile } = useProfile();
      const { createMeeting } = useWhereby();
      const [currentMonth, setCurrentMonth] = useState(new Date());
      const [selectedDate, setSelectedDate] = useState(new Date());
      const [availableSlots, setAvailableSlots] = useState([]);
      const [isLoading, setIsLoading] = useState(false);
      const [isBooking, setIsBooking] = useState(false);
      const [professional, setProfessional] = useState(null);
      const [error, setError] = useState(null);
      const [upcomingMeeting, setUpcomingMeeting] = useState(null);
      const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

      const fetchProfessional = useCallback(async () => {
        const { data, error } = await supabase.from('profiles').select('id, full_name').eq('role', 'admin').limit(1).single();
        if (error) {
          setError('Não foi possível encontrar o profissional para agendamento.');
        } else {
          setProfessional(data);
        }
      }, []);

      const fetchAvailableSlots = useCallback(async (month) => {
        if (!professional) return;
        setIsLoading(true);
        setError(null);
        try {
          const startDate = startOfMonth(month);
          const endDate = endOfMonth(month);

          const { data, error: fetchError } = await supabase.functions.invoke('get-available-slots', {
            body: {
              professionalId: professional.id,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            },
          });

          if (fetchError) throw fetchError;
          setAvailableSlots(data.map(slot => ({ ...slot, start: new Date(slot.start), end: new Date(slot.end) })));
        } catch (err) {
          console.error("Erro ao buscar horários:", err);
          setError('Não foi possível carregar os horários disponíveis.');
          toast({ title: 'Erro ao carregar horários', description: err.message, variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      }, [professional, toast]);

      const fetchUpcomingMeeting = useCallback(async () => {
        if (!patientId || !professional) return;

        const { data, error } = await supabase
          .from('appointments')
          .select('start_time, end_time, telemedicine_url, status')
          .eq('patient_id', patientId)
          .eq('professional_id', professional.id)
          .in('status', ['Agendada', 'Confirmada'])
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(1);

        if (error) console.error("Erro ao buscar próxima reunião:", error);
        if (data && data.length > 0) setUpcomingMeeting(data[0]);
        else setUpcomingMeeting(null);

      }, [patientId, professional]);


      useEffect(() => {
        fetchProfessional();
      }, [fetchProfessional]);

      useEffect(() => {
        if (professional) {
          fetchAvailableSlots(currentMonth);
          fetchUpcomingMeeting();
        }
      }, [professional, currentMonth, fetchAvailableSlots, fetchUpcomingMeeting]);

      const handleBookAppointment = async (slot) => {
        if (!professional || !patientId || !profile) {
          toast({ title: 'Erro', description: 'Informações do paciente ou profissional não encontradas.', variant: 'destructive' });
          return;
        }
        setIsBooking(true);
        try {
          const meetingData = await createMeeting({
            endDate: slot.end.toISOString(),
            fields: ['hostRoomUrl', 'viewerRoomUrl'],
          });

          if (!meetingData.viewerRoomUrl) {
            throw new Error("Não foi possível criar a sala de reunião. Tente novamente.");
          }

          const { error: insertError } = await supabase.from('appointments').insert({
            patient_id: patientId,
            professional_id: professional.id,
            start_time: slot.start.toISOString(),
            end_time: slot.end.toISOString(),
            status: 'Agendada',
            service_type: 'Bate-papo VIP (Cartão Esmeralda)',
            notes: `Agendado pelo portal do paciente.`,
            is_telemedicine: true,
            telemedicine_url: meetingData.viewerRoomUrl,
            created_by: profile.id,
          });

          if (insertError) throw insertError;

          toast({ title: 'Agendamento Confirmado!', description: `Sua consulta foi agendada para ${format(slot.start, 'dd/MM/yyyy HH:mm')}.`, variant: 'success' });
          fetchAvailableSlots(currentMonth);
          fetchUpcomingMeeting();
        } catch (err) {
          console.error("Erro ao agendar:", err);
          toast({ title: 'Erro ao agendar', description: err.message, variant: 'destructive' });
        } finally {
          setIsBooking(false);
        }
      };
      
      const filteredSlots = selectedDate ? availableSlots.filter(slot =>
        format(slot.start, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && slot.start > new Date()
      ).sort((a,b) => a.start - b.start) : [];


      if (error) {
        return <div className="text-center p-4 bg-destructive/10 text-destructive rounded-lg"><AlertTriangle className="mx-auto mb-2"/>{error}</div>
      }
      
      if (upcomingMeeting) {
        return (
           <Card className="card-glass text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2"><CalendarCheck className="text-green-400"/> Próximo Agendamento</CardTitle>
                <CardDescription>Você já tem um bate-papo agendado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-xl font-bold">{format(new Date(upcomingMeeting.start_time), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</p>
                <p className="text-sm text-violet-300">Status: <span className="font-semibold">{upcomingMeeting.status}</span></p>
                <Button onClick={() => setIsMeetingModalOpen(true)}>Acessar Sala de Reunião</Button>
            </CardContent>
             {isMeetingModalOpen && (
                <OnlineMeetingModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} meetingUrl={upcomingMeeting.telemedicine_url} />
            )}
        </Card>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={ptBR}
              className="rounded-md border bg-background/20"
              disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
            />
          </div>
          <div className="md:col-span-2">
            <Card className="card-glass h-full">
              <CardHeader>
                <CardTitle>Horários para {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '...'}</CardTitle>
                <CardDescription>Selecione um horário para seu bate-papo de 30 minutos.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto pr-2">
                {isLoading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div> :
                 filteredSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleBookAppointment(slot)}
                        disabled={isBooking}
                      >
                        {isBooking ? <Loader2 className="h-4 w-4 animate-spin"/> : format(slot.start, 'HH:mm')}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-violet-300 py-8">Nenhum horário disponível para esta data.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    };

    export default PatientScheduling;