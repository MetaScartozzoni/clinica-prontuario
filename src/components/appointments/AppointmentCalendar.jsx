import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import AppointmentModal from './AppointmentModal';

const AppointmentCalendar = ({ filters }) => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_unified_calendar_events', {
        professional_user_id_filter: filters.professionalId || null,
      });
      if (error) throw error;

      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.all_day,
        extendedProps: {
          ...event.resource,
          eventType: event.event_type,
          eventId: event.event_id,
          professionalId: event.professional_id,
          patientId: event.patient_id,
          status: event.status,
        },
        backgroundColor: getEventColor(event.event_type, event.status),
        borderColor: getEventColor(event.event_type, event.status),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      toast({
        title: 'Erro ao carregar eventos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getEventColor = (type, status) => {
    if (status === 'Cancelada') return '#ef4444'; // red-500
    if (type === 'appointment') {
      switch (status) {
        case 'Confirmada': return '#22c55e'; // green-500
        case 'Realizada': return '#6b7280'; // gray-500
        default: return '#3b82f6'; // blue-500
      }
    }
    if (type === 'surgery') {
      switch (status) {
        case 'Confirmada': return '#a855f7'; // purple-500
        case 'Realizada': return '#4b5563'; // gray-600
        default: return '#8b5cf6'; // violet-500
      }
    }
    return '#3b82f6';
  };

  const handleDateClick = (arg) => {
    setSelectedEvent(null);
    setSelectedDateInfo({ start: arg.date, end: arg.date });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    if (clickInfo.event.extendedProps.eventType === 'surgery') {
        toast({
            title: 'Visualização de Cirurgia',
            description: 'A edição de cirurgias deve ser feita pela tela de Cirurgias.',
        });
        return;
    }
    setSelectedEvent(clickInfo.event);
    setSelectedDateInfo(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDateInfo(null);
  };

  return (
    <div className="h-full w-full relative card-glass p-4 rounded-lg">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      )}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="timeGridWeek"
        events={events}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        locale="pt-br"
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
        }}
        allDaySlot={false}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        height="100%"
      />
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        event={selectedEvent}
        dateInfo={selectedDateInfo}
        onSuccess={fetchEvents}
      />
    </div>
  );
};

export default AppointmentCalendar;