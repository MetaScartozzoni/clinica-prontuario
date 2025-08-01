import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import { localizer, messages } from '@/config/calendar';
import { useToast } from '@/components/ui/use-toast';
import SurgeryCalendarModal from './SurgeryCalendarModal';
import ScheduleSurgeryModal from './ScheduleSurgeryModal'; // Importar o modal de agendamento
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient'; // Para buscar profissionais

const SurgeryCalendarView = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal para editar eventos existentes
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // Modal para agendar nova cirurgia
  const [slotInfo, setSlotInfo] = useState(null);
  const [filters, setFilters] = useState({ professional_id: 'todos', status: 'todos' });
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const { toast } = useToast();
  
  // Fetch professionals for filter dropdown
  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name').in('role', ['doctor', 'nurse']).order('full_name');
      if (data) setProfessionals(data);
      if (error) console.error("Error fetching professionals:", error);
    };
    fetchProfessionals();
  }, []);

  // Handler for filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
    }));
  }, []);

  // Fetch unified calendar events
  const fetchCalendarEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const { data, error } = await supabase.rpc('get_unified_calendar_events', {
        professional_user_id_filter: filters.professional_id === 'todos' ? null : filters.professional_id,
      });
      if (error) throw error;

      // Filter by status on the client-side for simplicity, as RPC function doesn't support it yet
      let filteredEvents = data || [];
      if (filters.status !== 'todos') {
        filteredEvents = filteredEvents.filter(event => event.status === filters.status);
      }
      setCalendarEvents(filteredEvents);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      toast({
        title: 'Erro ao carregar eventos do calendário',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingEvents(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchCalendarEvents();

    const channel = supabase
      .channel('public:appointments_and_surgeries_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchCalendarEvents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surgery_schedule' }, fetchCalendarEvents)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCalendarEvents]);

  const handleSelectSlot = useCallback(({ start, end }) => {
    setSlotInfo({ start, end });
    setSelectedEvent(null); 
    setIsScheduleModalOpen(true); // Abre o modal de agendamento para novo slot
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setSlotInfo(null); 
    setIsEditModalOpen(true); // Abre o modal de edição para evento existente
  }, []);

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsScheduleModalOpen(false);
    setSelectedEvent(null);
    setSlotInfo(null);
    fetchCalendarEvents(); // Refetch events after any modal action
  };

  const eventStyleGetter = useCallback((event) => {
    const isSurgery = event.event_type === 'surgery';
    const statusClassMap = {
      'Agendada': isSurgery ? 'bg-indigo-500' : 'bg-blue-500',
      'Confirmada': isSurgery ? 'bg-emerald-500' : 'bg-green-500',
      'Realizada': isSurgery ? 'bg-purple-500' : 'bg-lime-500',
      'Cancelada': isSurgery ? 'bg-red-500' : 'bg-gray-500',
      'Pendente': isSurgery ? 'bg-orange-500 text-black' : 'bg-yellow-500 text-black',
    };
    const className = statusClassMap[event.status] || 'bg-gray-500';
    const borderClass = isSurgery ? 'border-l-4 border-indigo-700' : 'border-l-4 border-blue-700';

    return {
      className: `!${className} ${borderClass} text-white font-semibold`,
    };
  }, []);
  
  // Filter only surgery events for the SurgeryCalendarView
  const surgeriesOnlyEvents = useMemo(() => {
    return calendarEvents.filter(event => event.event_type === 'surgery');
  }, [calendarEvents]);

  const modalEvent = selectedEvent ? {
      ...selectedEvent,
      title: selectedEvent.title,
    } : null;

  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
          <div className="w-full sm:w-auto sm:max-w-xs">
            <Label htmlFor="professional-filter" className="mb-2 block label-custom">Filtrar por Profissional</Label>
            <Select value={filters.professional_id} onValueChange={(v) => handleFilterChange('professional_id', v)}>
              <SelectTrigger id="professional-filter" className="select-trigger-custom">
                <SelectValue placeholder="Todos os Profissionais" />
              </SelectTrigger>
              <SelectContent className="select-content-custom">
                <SelectItem value="todos" className="select-item-custom">Todos os Profissionais</SelectItem>
                {professionals.map(prof => (
                  <SelectItem key={prof.id} value={prof.id} className="select-item-custom">{prof.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-auto sm:max-w-xs">
            <Label htmlFor="status-filter" className="mb-2 block label-custom">Filtrar por Status</Label>
            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger id="status-filter" className="select-trigger-custom">
                <SelectValue placeholder="Filtrar por status..." />
              </SelectTrigger>
              <SelectContent className="select-content-custom">
                <SelectItem value="todos" className="select-item-custom">Todos</SelectItem>
                <SelectItem value="Agendada" className="select-item-custom">Agendada</SelectItem>
                <SelectItem value="Confirmada" className="select-item-custom">Confirmada</SelectItem>
                <SelectItem value="Realizada" className="select-item-custom">Realizada</SelectItem>
                <SelectItem value="Cancelada" className="select-item-custom">Cancelada</SelectItem>
                <SelectItem value="Pendente" className="select-item-custom">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {isLoadingEvents && (
          <div className="absolute inset-0 bg-card/50 flex items-center justify-center z-10 rounded-b-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={surgeriesOnlyEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '75vh' }}
          messages={messages}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          culture="pt-BR"
        />
      </CardContent>
      {isEditModalOpen && modalEvent && (
        <SurgeryCalendarModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          event={modalEvent}
          onSaveSuccess={handleCloseModals}
          onDeleteSuccess={handleCloseModals}
        />
      )}
      {isScheduleModalOpen && slotInfo && (
        <ScheduleSurgeryModal
          isOpen={isScheduleModalOpen}
          onClose={handleCloseModals}
          initialDateTime={slotInfo.start}
        />
      )}
    </Card>
  );
};

export default SurgeryCalendarView;