import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';

const ContactRequestForm = ({ patientId, patientNameManual, professionals, onActionSuccess }) => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const { register, handleSubmit, control, reset, getValues } = useFormContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRequest = async (formData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('contact_requests').insert({
        patient_id: patientId,
        patient_name_manual: patientNameManual,
        patient_contact_manual: formData.patient_contact_manual_request,
        request_type: formData.request_type,
        content: formData.content,
        priority: formData.priority,
        assigned_to_profile_id: formData.assigned_to_profile_id,
        created_by_profile_id: profile.id,
        status: 'Pendente',
        patient_name_at_creation: patientNameManual,
        assigned_to_name_at_creation: professionals.find(p => p.id === formData.assigned_to_profile_id)?.full_name || 'Não Atribuído'
      });

      if (error) throw error;

      toast({ title: "✅ Sucesso!", description: "Solicitação registrada e enviada para a Central de Tarefas." });
      reset({
        content: '',
        patient_contact_manual_request: '',
        request_type: 'Recado',
        priority: 'Normal',
        assigned_to_profile_id: ''
      });
      if (onActionSuccess) onActionSuccess();
    } catch (error) {
      toast({ variant: "destructive", title: "❌ Erro ao registrar solicitação", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-white/20 pt-6">
      <h3 className="font-semibold text-lg text-white mb-4">Registrar Recado ou Solicitação</h3>
      <form onSubmit={handleSubmit(handleCreateRequest)} className="space-y-4">
        <Textarea placeholder="Digite o recado ou a solicitação do paciente..." {...register('content', { required: true })} className="textarea-light-theme" rows={3} />
        {patientId && (
          <Input placeholder="Telefone ou E-mail de Contato (se diferente do cadastro)" {...register('patient_contact_manual_request')} className="input-light-theme" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Controller
            name="request_type"
            control={control}
            defaultValue="Recado"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent className="select-content-custom">
                  <SelectItem value="Recado">Recado</SelectItem>
                  <SelectItem value="Solicitação">Solicitação</SelectItem>
                  <SelectItem value="Dúvida">Dúvida</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name="priority"
            control={control}
            defaultValue="Normal"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                <SelectContent className="select-content-custom">
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name="assigned_to_profile_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Atribuir para..." /></SelectTrigger>
                <SelectContent className="select-content-custom">
                  {professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name} ({p.role})</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading || !getValues('content')} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Registrar e Enviar para Tarefas
        </Button>
      </form>
    </div>
  );
};

export default ContactRequestForm;