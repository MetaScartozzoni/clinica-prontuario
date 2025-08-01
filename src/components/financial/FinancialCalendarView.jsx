import React, { useState, useCallback } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import { localizer, messages } from '@/config/calendar';
import useFinancialCalendar from '@/hooks/useFinancialCalendar';
import useAuthRole from '@/hooks/useAuthRole';
import FinancialCalendarModal from './FinancialCalendarModal';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const transactionStatuses = ["todos", "Pendente", "Pago", "Atrasado", "Cancelado"];
const transactionCategories = ["todos", "Conta a Pagar", "Conta a Receber", "Pagamento de Fornecedor", "Receita de Paciente", "Imposto", "Investimento", "Outra Receita", "Outra Despesa"];

const FinancialCalendarView = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotInfo, setSlotInfo] = useState(null);
  const [filters, setFilters] = useState({ status: 'todos', category: 'todos' });
  
  const {
    transactions,
    loading,
    fetchTransactions,
    addOrUpdateTransaction,
    deleteTransaction,
  } = useFinancialCalendar();
  
  const { hasRole } = useAuthRole();
  const canCreate = hasRole('admin_financeiro');

  const handleSelectSlot = useCallback(({ start, end }) => {
    if (!canCreate) return;
    setSlotInfo({ start, end });
    setSelectedEvent(null);
    setIsModalOpen(true);
  }, [canCreate]);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setSlotInfo(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSlotInfo(null);
  };

  const handleSaveEvent = async (eventData) => {
    const success = await addOrUpdateTransaction(eventData);
    if (success) {
      fetchTransactions(filters);
    }
    return success;
  };

  const handleDeleteEvent = async (eventId) => {
    const success = await deleteTransaction(eventId);
    if (success) {
      fetchTransactions(filters);
    }
    return success;
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    fetchTransactions(newFilters);
  };

  const eventStyleGetter = (event) => {
    const resource = event.resource || event;
    const isIncome = resource.transaction_type === 'Entrada';
    const statusClassMap = {
      'Pago': isIncome ? 'bg-green-500' : 'bg-green-700',
      'Pendente': 'bg-yellow-500 text-black',
      'Atrasado': 'bg-orange-600',
      'Cancelado': 'bg-gray-500',
    };
    const baseColor = isIncome ? 'bg-emerald-500' : 'bg-red-500';
    const className = statusClassMap[resource.status] || baseColor;
    
    return {
      className: `!${className} border-none`,
      style: {
        opacity: resource.status === 'Cancelado' ? 0.6 : 1,
      }
    };
  };

  const modalEvent = selectedEvent || (slotInfo ? { start: slotInfo.start, end: slotInfo.end } : null);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
          <div className="w-full sm:w-auto sm:max-w-xs">
            <Label htmlFor="status-filter" className="mb-2 block">Filtrar por Status</Label>
            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Filtrar por status..." />
              </SelectTrigger>
              <SelectContent>
                {transactionStatuses.map(s => <SelectItem key={s} value={s}>{s === 'todos' ? 'Todos' : s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-auto sm:max-w-xs">
            <Label htmlFor="category-filter" className="mb-2 block">Filtrar por Categoria</Label>
            <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Filtrar por categoria..." />
              </SelectTrigger>
              <SelectContent>
                {transactionCategories.map(c => <SelectItem key={c} value={c}>{c === 'todos' ? 'Todas' : c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {loading && (
          <div className="absolute inset-0 bg-card/50 flex items-center justify-center z-10 rounded-b-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={transactions}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '75vh' }}
          messages={messages}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          selectable={canCreate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          culture="pt-BR"
          tooltipAccessor={(event) => `R$ ${event.resource?.amount?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || '0,00'} - ${event.resource?.status}`}
        />
      </CardContent>
      {isModalOpen && (
        <FinancialCalendarModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          event={modalEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </Card>
  );
};

export default FinancialCalendarView;