import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Video } from 'lucide-react';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';

const AppointmentModal = ({ isOpen, onClose, event, dateInfo, onSuccess }) => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const isEditMode = !!event;

  const isTelemedicine = watch('is_telemedicine');

  const fetchDropdownData = useCallback(async () => {
    const { data: patientsData, error: patientsError } = await supabase.from('patients').select('id, full_name');
    if (patientsError) toast({ title: 'Erro ao buscar pacientes', variant: 'destructive' });
    else setPatients(patientsData);

    const { data: professionalsData, error: professionalsError } = await supabase.rpc('get_professionals_details');
    if (professionalsError) toast({ title: 'Erro ao buscar profissionais', variant: 'destructive' });
    else setProfessionals(professionalsData);
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      if (isEditMode) {
        const { extendedProps, start, end } = event.resource || event;
        const eventId = extendedProps?.appointment_id || event.extendedProps?.eventId;
        
        reset({
          patient_id: extendedProps?.patient_id || extendedProps?.patientId,
          professional_id: extendedProps?.professional_id || extendedProps?.professionalId,
          service_type: extendedProps?.service_type,
          start_date: format(new Date(start), 'yyyy-MM-dd'),
          start_time: format(new Date(start), 'HH:mm'),
          end_time: format(new Date(end), 'HH:mm'),
          status: extendedProps?.status,
          notes: extendedProps?.notes,
          is_telemedicine: extendedProps?.is_telemedicine || false,
          telemedicine_url: extendedProps?.telemedicine_url || '',
        });
      } else if (dateInfo) {
        reset({
          start_date: format(dateInfo.start, 'yyyy-MM-dd'),
          start_time: format(dateInfo.start, 'HH:mm'),
          end_time: format(new Date(dateInfo.start.getTime() + 30 * 60000), 'HH:mm'), // Add 30 mins default
          status: 'Agendada',
          is_telemedicine: false,
          telemedicine_url: '',
        });
      } else {
        reset({ status: 'Agendada', is_telemedicine: false, telemedicine_url: '' });
      }
    }
  }, [isOpen, event, dateInfo, isEditMode, reset, fetchDropdownData]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}:00`);
      const endDateTime = new Date(`${formData.start_date}T${formData.end_time}:00`);
      
      const eventIdToExclude = isEditMode ? (event.resource?.appointment_id || event.extendedProps?.eventId) : null;

      const { data: conflict } = await supabase.rpc('check_appointment_conflict', {
        p_professional_id: formData.professional_id,
        p_start_time: startDateTime.toISOString(),
        p_end_time: endDateTime.toISOString(),
        p_exclude_appointment_id: eventIdToExclude,
      });

      if (conflict) {
        toast({ title: 'Conflito de Horário', description: 'O profissional já possui um compromisso neste horário.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      const appointmentData = {
        patient_id: formData.patient_id,
        professional_id: formData.professional_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: formData.status,
        service_type: formData.service_type,
        notes: formData.notes,
        is_telemedicine: formData.is_telemedicine,
        telemedicine_url: formData.is_telemedicine ? formData.telemedicine_url : null,
      };

      let response;
      if (isEditMode) {
        response = await supabase.from('appointments').update(appointmentData).eq('id', eventIdToExclude);
      } else {
        response = await supabase.from('appointments').insert([appointmentData]);
      }

      if (response.error) throw response.error;

      toast({ title: `Consulta ${isEditMode ? 'atualizada' : 'agendada'} com sucesso!` });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: `Erro ao ${isEditMode ? 'salvar' : 'agendar'} consulta`, description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-dark-theme sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="dialog-title-custom">{isEditMode ? 'Editar Consulta' : 'Agendar Nova Consulta'}</DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Preencha os detalhes da consulta abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient_id" className="label-custom">Paciente</Label>
              <Controller name="patient_id" control={control} rules={{ required: 'Paciente é obrigatório' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione um paciente..." /></SelectTrigger>
                    <SelectContent className="select-content-custom">
                      {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              {errors.patient_id && <p className="text-red-400 text-xs mt-1">{errors.patient_id.message}</p>}
            </div>
            <div>
              <Label htmlFor="professional_id" className="label-custom">Profissional</Label>
              <Controller name="professional_id" control={control} rules={{ required: 'Profissional é obrigatório' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione um profissional..." /></SelectTrigger>
                    <SelectContent className="select-content-custom">
                      {professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              {errors.professional_id && <p className="text-red-400 text-xs mt-1">{errors.professional_id.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="service_type" className="label-custom">Tipo de Serviço</Label>
            <Input id="service_type" {...register('service_type', { required: 'Tipo de serviço é obrigatório' })} className="input-light-theme" />
            {errors.service_type && <p className="text-red-400 text-xs mt-1">{errors.service_type.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start_date" className="label-custom">Data</Label>
              <Input type="date" id="start_date" {...register('start_date', { required: 'Data é obrigatória' })} className="input-light-theme" />
              {errors.start_date && <p className="text-red-400 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <Label htmlFor="start_time" className="label-custom">Início</Label>
              <Input type="time" id="start_time" {...register('start_time', { required: 'Hora de início é obrigatória' })} className="input-light-theme" />
              {errors.start_time && <p className="text-red-400 text-xs mt-1">{errors.start_time.message}</p>}
            </div>
            <div>
              <Label htmlFor="end_time" className="label-custom">Fim</Label>
              <Input type="time" id="end_time" {...register('end_time', { required: 'Hora de fim é obrigatória' })} className="input-light-theme" />
              {errors.end_time && <p className="text-red-400 text-xs mt-1">{errors.end_time.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="status" className="label-custom">Status</Label>
            <Controller name="status" control={control} rules={{ required: 'Status é obrigatório' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione um status..." /></SelectTrigger>
                  <SelectContent className="select-content-custom">
                    <SelectItem value="Agendada">Agendada</SelectItem>
                    <SelectItem value="Confirmada">Confirmada</SelectItem>
                    <SelectItem value="Realizada">Realizada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                    <SelectItem value="Não Compareceu">Não Compareceu</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            {errors.status && <p className="text-red-400 text-xs mt-1">{errors.status.message}</p>}
          </div>
          <div className="space-y-2 rounded-md border border-violet-400/30 p-4">
             <div className="flex items-center space-x-2">
                <Controller name="is_telemedicine" control={control} render={({ field }) => <Switch id="is_telemedicine" checked={field.value} onCheckedChange={field.onChange} />} />
                <Label htmlFor="is_telemedicine" className="flex items-center gap-2 text-violet-200"><Video className="h-4 w-4"/>É uma Teleconsulta?</Label>
            </div>
            {isTelemedicine && (
                <div>
                    <Label htmlFor="telemedicine_url" className="label-custom">URL da Sala (Whereby)</Label>
                    <Input id="telemedicine_url" {...register('telemedicine_url', { required: isTelemedicine })} className="input-light-theme" placeholder="https://exemplo.whereby.com/sua-sala" />
                    {errors.telemedicine_url && <p className="text-red-400 text-xs mt-1">A URL da sala é obrigatória para teleconsultas.</p>}
                </div>
            )}
          </div>
          <div>
            <Label htmlFor="notes" className="label-custom">Observações</Label>
            <Textarea id="notes" {...register('notes')} className="input-light-theme" />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} className="btn-frutacor" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Salvar Alterações' : 'Agendar Consulta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;