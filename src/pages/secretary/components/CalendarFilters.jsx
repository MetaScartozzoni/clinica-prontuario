import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const CalendarFilters = ({ filters, onFilterChange, doctors }) => {

  const handleInputChange = (e) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value === 'todos' ? 'todos' : value });
  };

  const handleDateChange = (dateRange) => {
    onFilterChange({ ...filters, dateRange });
  };

  return (
    <div className="p-4 bg-card/50 rounded-lg flex flex-wrap items-end gap-4 mt-4">
      <div className="flex-grow min-w-[200px]">
        <Label className="text-sm font-medium text-muted-foreground">Buscar Paciente</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="patientSearch"
            placeholder="Nome do paciente..."
            value={filters.patientSearch}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex-grow min-w-[150px]">
        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
        <Select value={filters.status} onValueChange={(v) => handleSelectChange('status', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="aguardando">Aguardando</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
            <SelectItem value="pendente_aprovacao">Pendente Aprovação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-grow min-w-[150px]">
        <Label className="text-sm font-medium text-muted-foreground">Profissional</Label>
        <Select value={filters.professional} onValueChange={(v) => handleSelectChange('professional', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {doctors.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-grow min-w-[150px]">
        <Label className="text-sm font-medium text-muted-foreground">Tipo de Atendimento</Label>
        <Select value={filters.appointment_type} onValueChange={(v) => handleSelectChange('appointment_type', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Consulta">Consulta</SelectItem>
            <SelectItem value="Cirurgia">Cirurgia</SelectItem>
            <SelectItem value="Retorno">Retorno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-grow min-w-[250px]">
        <Label className="text-sm font-medium text-muted-foreground">Período</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                    {format(filters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Selecione um período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={filters.dateRange}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default CalendarFilters;