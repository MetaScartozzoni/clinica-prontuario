import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useWhereby } from '@/contexts/WherebyContext';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarPlus as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useProfile } from '@/contexts/ProfileContext';

const AppointmentScheduler = ({ patientId, onActionSuccess }) => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const { createMeeting, isLoading: isCreatingMeeting } = useWhereby();
  const [isLoading, setIsLoading] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSearchingSlots, setIsSearchingSlots] = useState(false);
  const [assignedToProfileId, setAssignedToProfileId] = useState('');

  const fetchProfessionals = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('role', ['doctor', 'nurse', 'admin', 'receptionist']);
    if (data) setProfessionals(data);
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate || !assignedToProfileId) {
      setAvailableSlots([]);
      return;
    }
    setIsSearchingSlots(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase.functions.invoke('get-available-slots', {
        body: {
          professionalId: assignedToProfileId,
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString()
        }
      });

      if (error) throw error;
      setAvailableSlots(data.map(slot => ({ ...slot, start: new Date(slot.start) })));
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao buscar horários", description: error.message });
      setAvailableSlots([]);
    } finally {
      setIsSearchingSlots(false);
    }
  }, [selectedDate, assignedToProfileId, toast]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  const handleScheduleAppointment = async (isTelemedicine) => {
    if (!patientId || !selectedDate || !selectedTime || !assignedToProfileId) {
      toast({ variant: "destructive", title: "Erro de Agendamento", description: "Preencha todos os campos: paciente, profissional, data e hora." });
      return;
    }

    setIsLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

      let telemedicineUrl = null;
      if (isTelemedicine) {
        const meetingData = await createMeeting({ endDate: endDateTime.toISOString() });
        if (!meetingData?.viewerRoomUrl) {
          throw new Error("Não foi possível criar a sala de reunião no Whereby.");
        }
        telemedicineUrl = meetingData.viewerRoomUrl;
      }

      const { error } = await supabase.from('appointments').insert({
        patient_id: patientId,
        professional_id: assignedToProfileId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'Agendada',
        service_type: 'Consulta',
        is_telemedicine: isTelemedicine,
        telemedicine_url: telemedicineUrl,
        created_by: profile.id,
      });

      if (error) throw error;

      toast({ title: "✅ Agendamento Confirmado!", description: `Consulta ${isTelemedicine ? 'online' : 'presencial'} para o paciente às ${selectedTime} em ${format(selectedDate, 'dd/MM/yyyy')}.` });
      toast({ title: "Simulação de SMS", description: `SMS de confirmação enviado para o paciente.`, variant: "info" });
      setSelectedDate(null);
      setSelectedTime('');
      setAvailableSlots([]);
      setAssignedToProfileId('');
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao agendar consulta", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-white/20 pt-6">
      <h3 className="font-semibold text-lg text-white mb-4">Agendamento Rápido</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select onValueChange={setAssignedToProfileId} value={assignedToProfileId}>
            <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecionar Profissional" /></SelectTrigger>
            <SelectContent className="select-content-custom">
              {professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name} ({p.role})</SelectItem>)}
            </SelectContent>
          </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {selectedDate && assignedToProfileId && (
        <div className="mb-4">
          <label className="text-violet-200 font-medium mb-2 block">Horários Disponíveis (30min slots)</label>
          {isSearchingSlots ? (
            <div className="flex justify-center items-center h-20"><Loader2 className="h-6 w-6 animate-spin text-violet-400" /></div>
          ) : availableSlots.length > 0 ? (
            <ScrollArea className="h-[120px] w-full rounded-md border border-white/20 p-2">
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot, index) => (
                  <Button 
                    key={index} 
                    variant={selectedTime === format(slot.start, 'HH:mm') ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(format(slot.start, 'HH:mm'))}
                  >
                    {format(slot.start, 'HH:mm')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-violet-200">Nenhum horário disponível para a data e profissional selecionados.</p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => handleScheduleAppointment(false)} className="flex-1" disabled={isLoading || isCreatingMeeting || !selectedDate || !selectedTime || !assignedToProfileId || !patientId}>
          {isLoading || isCreatingMeeting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Agendar Consulta Presencial
        </Button>
        <Button onClick={() => handleScheduleAppointment(true)} variant="secondary" className="flex-1" disabled={isLoading || isCreatingMeeting || !selectedDate || !selectedTime || !assignedToProfileId || !patientId}>
          {isLoading || isCreatingMeeting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Agendar Online (Whereby)
        </Button>
      </div>
    </div>
  );
};

export default AppointmentScheduler;