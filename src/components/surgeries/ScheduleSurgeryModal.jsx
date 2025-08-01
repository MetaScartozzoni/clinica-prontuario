import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CalendarPlus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSurgeries } from '@/hooks/useSurgeries';

const ScheduleSurgeryModal = ({ isOpen, onClose, quoteToSchedule, onSurgeryScheduled, patientId: passedPatientId, patientName: passedPatientName, initialDateTime }) => {
  const { toast } = useToast();
  const { session } = useAuth();
  const { createSurgery } = useSurgeries();

  const initialFormState = {
    patient_id: '',
    patient_name: '',
    patient_phone: '',
    professional_id: '',
    surgery_type_id: '',
    custom_surgery_name: '',
    scheduled_date_time: '',
    duration_minutes: '120',
    hospital_name: '',
    room_number: '',
    status: 'Agendada',
    financial_status: 'Pendente',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [surgeryTypes, setSurgeryTypes] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    const fetchDependencies = async () => {
      const { data: stData } = await supabase.from('surgery_types').select('id, name').order('name');
      setSurgeryTypes(stData || []);
      const { data: profData } = await supabase.from('profiles').select('id, full_name').in('role', ['doctor', 'nurse']).order('full_name');
      setProfessionals(profData || []);
    };
    if (isOpen) {
      fetchDependencies();
    }
  }, [isOpen]);

  const handlePatientSelect = useCallback((patient) => {
    setFormData(prev => ({
      ...prev,
      patient_id: patient.id,
      patient_name: patient.full_name,
      patient_phone: patient.phone,
    }));
    setPatientSearchTerm('');
    setPatientSearchResults([]);
  }, []);
  
  const fetchPatientInfo = useCallback(async (pId) => {
    if (!pId) return;
    const { data, error } = await supabase.from('patients').select('id, full_name, phone').eq('id', pId).single();
    if (data) {
      handlePatientSelect(data);
    } else if (error) {
      toast({ title: 'Erro', description: 'Não foi possível carregar informações do paciente.', variant: 'destructive' });
    }
  }, [toast, handlePatientSelect]);


  useEffect(() => {
    if (isOpen) {
      const patientId = quoteToSchedule?.patient_id || passedPatientId;
      const patientName = quoteToSchedule?.patient_name || passedPatientName;
      
      const suggestedDateTime = initialDateTime 
        ? new Date(initialDateTime)
        : (quoteToSchedule?.proposed_surgery_date 
            ? new Date(`${quoteToSchedule.proposed_surgery_date}T09:00:00`)
            : new Date());

      setFormData({
        ...initialFormState,
        patient_id: patientId || '',
        patient_name: patientName || '',
        professional_id: session?.user?.id || '',
        surgery_type_id: quoteToSchedule?.surgery_type_id || '',
        custom_surgery_name: quoteToSchedule?.custom_surgery_name || '',
        notes: quoteToSchedule ? `Cirurgia agendada a partir do orçamento #${quoteToSchedule.id}. ${quoteToSchedule.observation || ''}`.trim() : '',
        scheduled_date_time: suggestedDateTime.toISOString().slice(0, 16),
      });

      if(patientId) {
        fetchPatientInfo(patientId);
      } else {
        setPatientSearchTerm('');
      }
    }
  }, [isOpen, quoteToSchedule, passedPatientId, passedPatientName, session, fetchPatientInfo, initialDateTime]);

  useEffect(() => {
    const searchPatients = async () => {
      if (patientSearchTerm.length < 3) {
        setPatientSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone, cpf, email')
        .or(`full_name.ilike.%${patientSearchTerm}%,cpf.ilike.%${patientSearchTerm}%,email.ilike.%${patientSearchTerm}%`)
        .limit(10);
      
      if (error) {
        toast({ title: 'Erro ao buscar pacientes', description: error.message, variant: 'destructive' });
      } else {
        setPatientSearchResults(data);
      }
      setIsSearching(false);
    };

    const debounceSearch = setTimeout(() => {
      searchPatients();
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [patientSearchTerm, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
        toast({ title: 'Paciente não selecionado', description: 'Por favor, busque e selecione um paciente.', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    const { success } = await createSurgery({
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
    });
    if (success) {
      if (quoteToSchedule?.id) {
        await supabase.from('quotes').update({ status: 'Cirurgia Agendada' }).eq('id', quoteToSchedule.id);
      }
      if(onSurgeryScheduled) onSurgeryScheduled();
      onClose();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl modal-dark-theme">
        <DialogHeader>
          <DialogTitle className="flex items-center dialog-title-custom">
            <CalendarPlus className="mr-2 h-6 w-6 text-primary" /> Agendar Nova Cirurgia
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Preencha os detalhes para agendar a cirurgia. Comece buscando pelo paciente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="patient_search_sched" className="label-custom">Buscar Paciente (Nome, CPF, Email)</Label>
                  <Popover open={patientSearchTerm.length > 2 && patientSearchResults.length > 0} onOpenChange={() => {}}>
                      <PopoverTrigger asChild>
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                  id="patient_search_sched"
                                  value={patientSearchTerm}
                                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                                  placeholder="Digite para buscar..."
                                  className="input-light-theme pl-10"
                                  disabled={!!formData.patient_id}
                              />
                          </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          {isSearching ? (
                              <div className="p-4 text-center">Carregando...</div>
                          ) : (
                              <ul className="max-h-60 overflow-y-auto">
                                  {patientSearchResults.map(p => (
                                      <li key={p.id} onClick={() => handlePatientSelect(p)}
                                          className="p-2 hover:bg-accent/10 cursor-pointer text-sm">
                                          {p.full_name} <span className="text-xs text-muted-foreground">({p.cpf || p.email})</span>
                                      </li>
                                  ))}
                              </ul>
                          )}
                      </PopoverContent>
                  </Popover>
              </div>
              <div>
                  <Button type="button" variant="outline" onClick={() => {
                      setFormData(prev => ({ ...prev, patient_id: '', patient_name: '', patient_phone: ''}));
                      setPatientSearchTerm('');
                  }} className="mt-7 w-full">
                      Limpar Paciente
                  </Button>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <Label className="label-custom">Nome do Paciente</Label>
               <Input value={formData.patient_name} readOnly disabled className="input-light-theme" />
             </div>
             <div>
               <Label className="label-custom">Telefone</Label>
               <Input value={formData.patient_phone} readOnly disabled className="input-light-theme" />
             </div>
           </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="professional_id_sched_modal" className="label-custom">Profissional Responsável</Label>
                <Select name="professional_id" value={formData.professional_id} onValueChange={(value) => handleSelectChange('professional_id', value)} required>
                  <SelectTrigger id="professional_id_sched_modal" className="select-trigger-custom"><SelectValue placeholder="Selecione um profissional" /></SelectTrigger>
                  <SelectContent className="select-content-custom">
                    {professionals.map(prof => <SelectItem key={prof.id} value={prof.id} className="select-item-custom">{prof.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="surgery_type_id_sched_modal" className="label-custom">Tipo de Cirurgia (Base)</Label>
                <Select name="surgery_type_id" value={formData.surgery_type_id} onValueChange={(value) => handleSelectChange('surgery_type_id', value)}>
                  <SelectTrigger id="surgery_type_id_sched_modal" className="select-trigger-custom"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent className="select-content-custom">
                    {surgeryTypes.map(st => <SelectItem key={st.id} value={st.id} className="select-item-custom">{st.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custom_surgery_name_sched_modal" className="label-custom">Nome da Cirurgia (Personalizado)</Label>
                <Input id="custom_surgery_name_sched_modal" name="custom_surgery_name" value={formData.custom_surgery_name} onChange={handleInputChange} placeholder="Ex: Lifting Facial + Pálpebras" className="input-light-theme"/>
              </div>
              <div>
                <Label htmlFor="scheduled_date_time_sched_modal" className="label-custom">Data e Hora da Cirurgia</Label>
                <Input id="scheduled_date_time_sched_modal" name="scheduled_date_time" type="datetime-local" value={formData.scheduled_date_time} onChange={handleInputChange} required className="input-light-theme"/>
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration_minutes_sched_modal" className="label-custom">Duração Estimada (minutos)</Label>
                <Input id="duration_minutes_sched_modal" name="duration_minutes" type="number" value={formData.duration_minutes} onChange={handleInputChange} placeholder="120" className="input-light-theme"/>
              </div>
              <div>
                <Label htmlFor="hospital_name_sched_modal" className="label-custom">Nome do Hospital</Label>
                <Input id="hospital_name_sched_modal" name="hospital_name" value={formData.hospital_name} onChange={handleInputChange} className="input-light-theme"/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room_number_sched_modal" className="label-custom">Número da Sala</Label>
                <Input id="room_number_sched_modal" name="room_number" value={formData.room_number} onChange={handleInputChange} className="input-light-theme"/>
              </div>
              <div>
                <Label htmlFor="status_sched_modal" className="label-custom">Status da Cirurgia</Label>
                <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger id="status_sched_modal" className="select-trigger-custom"><SelectValue /></SelectTrigger>
                  <SelectContent className="select-content-custom">
                    <SelectItem value="Agendada" className="select-item-custom">Agendada</SelectItem>
                    <SelectItem value="Confirmada" className="select-item-custom">Confirmada</SelectItem>
                    <SelectItem value="Realizada" className="select-item-custom">Realizada</SelectItem>
                    <SelectItem value="Cancelada" className="select-item-custom">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="financial_status_sched_modal" className="label-custom">Status Financeiro</Label>
              <Select name="financial_status" value={formData.financial_status} onValueChange={(value) => handleSelectChange('financial_status', value)}>
                <SelectTrigger id="financial_status_sched_modal" className="select-trigger-custom"><SelectValue /></SelectTrigger>
                <SelectContent className="select-content-custom">
                  <SelectItem value="Pendente" className="select-item-custom">Pendente</SelectItem>
                  <SelectItem value="Pago Parcialmente" className="select-item-custom">Pago Parcialmente</SelectItem>
                  <SelectItem value="Pago Totalmente" className="select-item-custom">Pago Totalmente</SelectItem>
                  <SelectItem value="Aguardando Aprovação" className="select-item-custom">Aguardando Aprovação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          <div>
            <Label htmlFor="notes_sched_modal" className="label-custom">Observações Adicionais</Label>
            <Textarea id="notes_sched_modal" name="notes" value={formData.notes} onChange={handleInputChange} className="textarea-light-theme"/>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !formData.patient_id} className="btn-frutacor">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Cirurgia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleSurgeryModal;