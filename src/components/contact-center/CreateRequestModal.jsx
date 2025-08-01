import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const priorities = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

const contactTypes = [
    { value: 'direct_contact', label: 'Contato Direto (Telefone/Call)', duration: 15 },
    { value: 'budget_discussion', label: 'Discussão de Orçamento', duration: 15 },
    { value: 'sos_emergency', label: 'Emergência (SOS)', duration: 30 },
];

const CreateRequestModal = ({ isOpen, onClose, onSave, patients, doctors }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    subject: '',
    details: '',
    priority: 'medium',
    contact_type: 'direct_contact',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.doctor_id || !formData.subject) {
      toast({ title: 'Campos obrigatórios', description: 'Paciente, Médico e Assunto são obrigatórios.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    try {
        const selectedContactType = contactTypes.find(ct => ct.value === formData.contact_type);
        
        const { data: nextSlot, error: slotError } = await supabase.rpc('find_next_available_slot', {
            p_doctor_id: formData.doctor_id,
            p_event_type: formData.contact_type,
            p_duration_minutes: selectedContactType.duration,
            p_start_search_date: new Date().toISOString()
        });

        if (slotError) throw slotError;

        if (!nextSlot) {
            toast({ title: 'Indisponível', description: 'Não foi encontrado um horário disponível para este tipo de contato. Verifique as regras de disponibilidade do médico.', variant: 'warning' });
            setIsSubmitting(false);
            return;
        }

        const requestPayload = {
            patient_id: formData.patient_id,
            doctor_id: formData.doctor_id,
            subject: formData.subject,
            details: formData.details,
            priority: formData.priority,
            scheduled_for: nextSlot,
        };

        const result = await onSave(requestPayload);
        if (result.success) {
            toast({
                title: 'Horário Sugerido',
                description: `Próximo horário livre encontrado: ${new Date(nextSlot).toLocaleString('pt-BR')}. A solicitação aguarda aprovação.`,
                variant: 'info',
                duration: 10000
            });
            onClose();
        }
    } catch (error) {
        toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Contato</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para agendar um contato. O sistema encontrará o próximo horário disponível.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label htmlFor="patient_id">Paciente</Label>
            <Select name="patient_id" value={formData.patient_id} onValueChange={(v) => handleSelectChange('patient_id', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
              <SelectContent>
                {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Fidelidade: {p.loyalty_level})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doctor_id">Médico</Label>
            <Select name="doctor_id" value={formData.doctor_id} onValueChange={(v) => handleSelectChange('doctor_id', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione um médico" /></SelectTrigger>
              <SelectContent>
                {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact_type">Tipo de Contato</Label>
            <Select name="contact_type" value={formData.contact_type} onValueChange={(v) => handleSelectChange('contact_type', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                {contactTypes.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Ex: Dúvida sobre pós-operatório" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select name="priority" value={formData.priority} onValueChange={(v) => handleSelectChange('priority', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione a prioridade" /></SelectTrigger>
              <SelectContent>
                {priorities.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">Detalhes</Label>
            <Textarea id="details" name="details" value={formData.details} onChange={handleChange} placeholder="Forneça mais detalhes sobre a solicitação..." />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Buscar Horário e Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequestModal;