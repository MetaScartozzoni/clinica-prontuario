import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSurgeries } from '@/hooks/useSurgeries'; // Importar o hook useSurgeries
import { supabase } from '@/lib/supabaseClient'; // Para buscar profissionais e tipos de cirurgia
import { Loader2, Save } from 'lucide-react';

const SurgeryCalendarModal = ({ isOpen, onClose, event, onSaveSuccess, onDeleteSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth(); // Para verificar permissões se necessário
  const { createSurgery, updateSurgery, deleteSurgery } = useSurgeries(); // Funções do hook
  
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [surgeryTypes, setSurgeryTypes] = useState([]);

  // Mock de permissões (substituir por lógica real de permissões se necessário)
  const canEdit = true; // Assumindo que quem abre o modal pode editar/criar por enquanto
  const canDelete = true; // Assumindo que quem abre o modal pode deletar por enquanto

  useEffect(() => {
    const fetchDependencies = async () => {
      const { data: patientsData, error: patientsError } = await supabase.from('patients').select('id, full_name').order('full_name');
      if (patientsData) setPatients(patientsData); else console.error(patientsError);

      const { data: professionalsData, error: professionalsError } = await supabase.from('profiles').select('id, full_name').in('role', ['doctor', 'nurse']).order('full_name');
      if (professionalsData) setProfessionals(professionalsData); else console.error(professionalsError);

      const { data: surgeryTypesData, error: surgeryTypesError } = await supabase.from('surgery_types').select('id, name').order('name');
      if (surgeryTypesData) setSurgeryTypes(surgeryTypesData); else console.error(surgeryTypesError);
    };
    if (isOpen) {
      fetchDependencies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (event) {
      setFormData({
        id: event.event_id || null, // ID da cirurgia (se for edição)
        patient_id: event.patient_id || '',
        professional_id: event.professional_id || user?.id || '', // Preenche com o ID do profissional do evento ou do usuário logado
        surgery_type_id: event.resource?.surgery_type_id || '', // Obtém do recurso se existir
        custom_surgery_name: event.resource?.custom_surgery_name || event.title?.split(' - ')[1] || '',
        scheduled_date_time: event.start ? new Date(event.start).toISOString().slice(0, 16) : '',
        duration_minutes: event.resource?.duration_minutes || 120,
        hospital_name: event.resource?.hospital_name || '',
        room_number: event.resource?.room_number || '',
        status: event.status || 'Agendada',
        financial_status: event.resource?.financial_status || 'Pendente',
        notes: event.notes || '',
      });
    }
  }, [event, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'surgery_type_id' && value) {
      const selectedType = surgeryTypes.find(st => st.id === value);
      if (selectedType) {
        setFormData(prev => ({ ...prev, custom_surgery_name: selectedType.name }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSubmit = {
      patient_id: formData.patient_id,
      professional_id: formData.professional_id,
      surgery_type_id: formData.surgery_type_id || null,
      custom_surgery_name: formData.custom_surgery_name,
      scheduled_date_time: new Date(formData.scheduled_date_time).toISOString(),
      duration_minutes: parseInt(formData.duration_minutes, 10),
      hospital_name: formData.hospital_name,
      room_number: formData.room_number,
      status: formData.status,
      financial_status: formData.financial_status,
      notes: formData.notes,
    };

    let result;
    if (formData.id) {
      result = await updateSurgery(formData.id, dataToSubmit);
    } else {
      result = await createSurgery(dataToSubmit);
    }

    if (result.success) {
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    setIsSubmitting(true);
    const result = await deleteSurgery(formData.id);
    if (result.success) {
      if (onDeleteSuccess) onDeleteSuccess();
      onClose();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg modal-dark-theme">
        <DialogHeader>
          <DialogTitle className="dialog-title-custom">{formData.id ? 'Editar Cirurgia' : 'Nova Cirurgia'}</DialogTitle>
          <DialogDescription className="dialog-description-custom">
            {canEdit ? 'Preencha os detalhes da cirurgia.' : 'Visualizando detalhes da cirurgia.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label htmlFor="patient_id" className="label-custom">Paciente</Label>
            <Select name="patient_id" value={formData.patient_id} onValueChange={(v) => handleSelectChange('patient_id', v)} disabled={!canEdit} required>
              <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
              <SelectContent className="select-content-custom">
                {patients.map(p => <SelectItem key={p.id} value={p.id} className="select-item-custom">{p.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="professional_id" className="label-custom">Profissional Responsável</Label>
            <Select name="professional_id" value={formData.professional_id} onValueChange={(v) => handleSelectChange('professional_id', v)} disabled={!canEdit} required>
              <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione um profissional" /></SelectTrigger>
              <SelectContent className="select-content-custom">
                {professionals.map(d => <SelectItem key={d.id} value={d.id} className="select-item-custom">{d.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scheduled_date_time" className="label-custom">Data e Hora</Label>
            <Input id="scheduled_date_time" name="scheduled_date_time" type="datetime-local" value={formData.scheduled_date_time || ''} onChange={handleChange} disabled={!canEdit} required className="input-light-theme" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="surgery_type_id" className="label-custom">Tipo de Cirurgia (Base)</Label>
            <Select name="surgery_type_id" value={formData.surgery_type_id} onValueChange={(v) => handleSelectChange('surgery_type_id', v)} disabled={!canEdit}>
              <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione um tipo" /></SelectTrigger>
              <SelectContent className="select-content-custom">
                {surgeryTypes.map(st => <SelectItem key={st.id} value={st.id} className="select-item-custom">{st.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="custom_surgery_name" className="label-custom">Nome da Cirurgia (Personalizado)</Label>
            <Input id="custom_surgery_name" name="custom_surgery_name" value={formData.custom_surgery_name || ''} onChange={handleChange} disabled={!canEdit} placeholder="Ex: Rinoplastia + Mento" className="input-light-theme" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration_minutes" className="label-custom">Duração Estimada (minutos)</Label>
            <Input id="duration_minutes" name="duration_minutes" type="number" value={formData.duration_minutes || ''} onChange={handleChange} disabled={!canEdit} placeholder="120" className="input-light-theme" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status" className="label-custom">Status</Label>
            <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)} disabled={!canEdit}>
              <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
              <SelectContent className="select-content-custom">
                <SelectItem value="Agendada" className="select-item-custom">Agendada</SelectItem>
                <SelectItem value="Confirmada" className="select-item-custom">Confirmada</SelectItem>
                <SelectItem value="Realizada" className="select-item-custom">Realizada</SelectItem>
                <SelectItem value="Cancelada" className="select-item-custom">Cancelada</SelectItem>
                <SelectItem value="Pendente" className="select-item-custom">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="financial_status" className="label-custom">Status Financeiro</Label>
            <Select name="financial_status" value={formData.financial_status} onValueChange={(v) => handleSelectChange('financial_status', v)} disabled={!canEdit}>
              <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione o status financeiro" /></SelectTrigger>
              <SelectContent className="select-content-custom">
                <SelectItem value="Pendente" className="select-item-custom">Pendente</SelectItem>
                <SelectItem value="Pago Parcialmente" className="select-item-custom">Pago Parcialmente</SelectItem>
                <SelectItem value="Pago Totalmente" className="select-item-custom">Pago Totalmente</SelectItem>
                <SelectItem value="Aguardando Aprovação" className="select-item-custom">Aguardando Aprovação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="hospital_name" className="label-custom">Hospital</Label>
            <Input id="hospital_name" name="hospital_name" value={formData.hospital_name || ''} onChange={handleChange} disabled={!canEdit} placeholder="Nome do hospital" className="input-light-theme" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="room_number" className="label-custom">Número da Sala</Label>
            <Input id="room_number" name="room_number" value={formData.room_number || ''} onChange={handleChange} disabled={!canEdit} placeholder="Número da sala" className="input-light-theme" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes" className="label-custom">Notas</Label>
            <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} disabled={!canEdit} placeholder="Notas adicionais sobre a cirurgia..." className="textarea-light-theme" />
          </div>
        </form>
        <DialogFooter className="sm:justify-between">
          <div>
            {formData.id && canDelete && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>Excluir</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            {canEdit && (
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="btn-frutacor">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SurgeryCalendarModal;