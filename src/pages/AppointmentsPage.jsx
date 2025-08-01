
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { CalendarPlus, Loader2, ListFilter, Users, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';

import AppointmentModal from '@/components/appointments/AppointmentModal';
import { useProfile } from '@/contexts/ProfileContext';

const AppointmentsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [professionals, setProfessionals] = useState([]);
  const [professionalFilter, setProfessionalFilter] = useState('all');

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    const professionalId = professionalFilter === 'all' ? null : professionalFilter;
    
    const { data, error } = await supabase.rpc('get_unified_calendar_events', { professional_user_id_filter: professionalId });

    if (error) {
      toast({ title: 'Erro ao buscar agendamentos', description: error.message, variant: 'destructive' });
      setEvents([]);
    } else {
      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: event.all_day,
        extendedProps: { ...event.resource, eventId: event.event_id, eventType: event.event_type, patientId: event.patient_id },
        backgroundColor: event.event_type === 'surgery' ? '#581c87' : '#1d4ed8',
        borderColor: event.event_type === 'surgery' ? '#a855f7' : '#60a5fa',
      }));
      setEvents(formattedEvents);
    }
    setIsLoading(false);
  }, [toast, professionalFilter]);

  const fetchProfessionals = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_professionals_details');
    if (error) {
      toast({ title: 'Erro ao buscar profissionais', description: error.message, variant: 'destructive' });
    } else {
      setProfessionals(data);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
    fetchProfessionals();
  }, [fetchEvents, fetchProfessionals]);

  const handleDateSelect = (selectInfo) => {
    setSelectedEvent(null);
    setSelectedDateInfo(selectInfo);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedDateInfo(null);
    const { extendedProps } = clickInfo.event;
    if (extendedProps.type === 'appointment') {
      setSelectedEvent({ ...clickInfo.event, resource: clickInfo.event.extendedProps });
      setIsModalOpen(true);
    } else {
        toast({ title: "Cirurgia Selecionada", description: "A edição de cirurgias deve ser feita na página de Cirurgias.", variant: 'info' });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDateInfo(null);
  };
  
  const handleSuccess = () => {
    fetchEvents();
    closeModal();
  };

  const handleInitiateAppointment = (eventProps) => {
    const patientId = eventProps.patientId;
    const appointmentId = eventProps.appointment_id;
    navigate(`/atendimento/${patientId}`, { state: { appointmentId } });
  };
  
  const eventContent = (eventInfo) => {
    const { extendedProps } = eventInfo.event;
    return (
      <div className="p-1 text-white overflow-hidden h-full flex flex-col justify-between">
        <div>
          <b className="text-xs font-semibold">{eventInfo.timeText}</b>
          <p className="text-xs truncate">{eventInfo.event.title}</p>
        </div>
        {(profile?.role === 'doctor' || profile?.role === 'admin') && extendedProps.type === 'appointment' && (
           <Button
            size="xs"
            className="mt-1 w-full text-xs h-6 bg-green-500 hover:bg-green-600"
            onClick={(e) => {
                e.stopPropagation();
                handleInitiateAppointment(extendedProps);
            }}
          >
            <Stethoscope className="mr-1 h-3 w-3" />
            Atender
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Agenda</title>
        <meta name="description" content="Visualize e gerencie todos os agendamentos da clínica." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="page-title">Agenda Unificada</h1>
            <p className="page-subtitle">Visualize consultas e cirurgias em um só lugar.</p>
          </div>
          <Button onClick={() => handleDateSelect({ start: new Date() })} className="btn-frutacor mt-4 sm:mt-0">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nova Consulta
          </Button>
        </div>

        <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="flex items-center gap-2"><ListFilter className="h-5 w-5 text-violet-400" /> Filtros</CardTitle>
               {isLoading && <Loader2 className="h-5 w-5 animate-spin text-violet-400" />}
            </CardHeader>
            <CardContent>
                <div className="w-full sm:w-64">
                    <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                        <SelectTrigger className="select-trigger-custom">
                            <Users className="mr-2 h-4 w-4 text-violet-300" />
                            <SelectValue placeholder="Filtrar por profissional..." />
                        </SelectTrigger>
                        <SelectContent className="select-content-custom">
                            <SelectItem value="all">Todos os Profissionais</SelectItem>
                            {professionals.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.full_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-6">
          <Card className="card-glass p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="timeGridWeek"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              locale="pt-br"
              buttonText={{
                today:    'Hoje',
                month:    'Mês',
                week:     'Semana',
                day:      'Dia',
              }}
              eventContent={eventContent}
              height="auto"
              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
            />
          </Card>
        </motion.div>
      </motion.div>

      {isModalOpen && (
        <AppointmentModal
            isOpen={isModalOpen}
            onClose={closeModal}
            event={selectedEvent}
            dateInfo={selectedDateInfo}
            onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default AppointmentsPage;
