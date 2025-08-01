import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MessageSquarePlus } from 'lucide-react';

const NegotiationModal = ({ isOpen, onClose, negotiationData, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    clinic_value: '',
    hospital_value: '',
    materials_value: '',
    total_value: '',
    observation: '',
    clinic_response: '',
    status: 'Em Negociação', 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (negotiationData?.budget) {
      const budget = negotiationData.budget;
      setFormData({
        clinic_value: budget.clinic_base_cost || 0,
        hospital_value: budget.hospital_base_cost || 0,
        materials_value: (budget.selected_extra_materials || []).reduce((sum, mat) => sum + (parseFloat(mat.cost) || 0), 0),
        total_value: budget.total_value || 0,
        observation: negotiationData.last_negotiation?.observation || budget.observation || '',
        clinic_response: negotiationData.last_negotiation?.clinic_response || budget.clinic_response || '',
        status: negotiationData.last_negotiation?.status || budget.status || 'Em Negociação',
      });
    } else if (isOpen) { // Reset form if no data but modal is open
        setFormData({
            clinic_value: '', hospital_value: '', materials_value: '', total_value: '',
            observation: '', clinic_response: '', status: 'Em Negociação',
        });
    }
  }, [negotiationData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      if (['clinic_value', 'hospital_value', 'materials_value'].includes(name)) {
        const clinic = parseFloat(updatedData.clinic_value) || 0;
        const hospital = parseFloat(updatedData.hospital_value) || 0;
        const materials = parseFloat(updatedData.materials_value) || 0;
        updatedData.total_value = clinic + hospital + materials;
      }
      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!negotiationData?.budget?.id) {
      toast({ title: "Erro", description: "ID do orçamento não encontrado.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const negotiationRecord = {
      budget_id: negotiationData.budget.id,
      patient_id: negotiationData.budget.current_patient_id || negotiationData.budget.patient_id,
      patient_name: negotiationData.budget.patient_name,
      patient_phone: negotiationData.budget.patient_phone,
      surgery_name: negotiationData.budget.custom_surgery_name || negotiationData.budget.surgery_name,
      status: formData.status,
      negotiation_date: new Date().toISOString().split('T')[0],
      clinic_value: parseFloat(formData.clinic_value) || 0,
      hospital_value: parseFloat(formData.hospital_value) || 0,
      materials_value: parseFloat(formData.materials_value) || 0,
      total_value: parseFloat(formData.total_value) || 0,
      observation: formData.observation,
      clinic_response: formData.clinic_response,
      negotiated_by: localStorage.getItem('currentUser') || 'Sistema', 
      negotiation_version: (negotiationData.last_negotiation?.negotiation_version || 0) + 1,
    };

    try {
      const { error: negotiationError } = await supabase
        .from('budget_negotiations')
        .insert(negotiationRecord);

      if (negotiationError) throw negotiationError;

      const { error: budgetUpdateError } = await supabase
        .from('budgets')
        .update({ 
            status: formData.status,
            total_value: negotiationRecord.total_value,
            clinic_base_cost: negotiationRecord.clinic_value,
            hospital_base_cost: negotiationRecord.hospital_value,
            observation: formData.observation, 
            clinic_response: formData.clinic_response,
            updated_at: new Date().toISOString(),
         })
        .eq('id', negotiationData.budget.id);

      if (budgetUpdateError) throw budgetUpdateError;

      toast({ title: "Negociação Salva", description: "A nova versão da negociação foi registrada.", variant: "success" });
      if(onSave) onSave(); 
      onClose();
    } catch (error) {
      toast({ title: "Erro ao Salvar Negociação", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!negotiationData?.budget && isOpen) { // Show loading or placeholder if modal is open but data not ready
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg modal-light-theme">
                <DialogHeader>
                    <DialogTitle className="dialog-title-custom">Carregando Dados da Negociação...</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            </DialogContent>
        </Dialog>
    );
  }
  if (!isOpen) return null;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg modal-light-theme">
        <DialogHeader>
          <DialogTitle className="flex items-center dialog-title-custom">
            <MessageSquarePlus className="mr-2 h-6 w-6 text-primary" /> Registrar Nova Negociação
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Para o orçamento de {negotiationData.budget.patient_name} - {negotiationData.budget.custom_surgery_name || negotiationData.budget.surgery_name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="clinic_value_neg_modal" className="label-custom">Valor Clínica (R$)</Label>
            <Input id="clinic_value_neg_modal" name="clinic_value" type="number" step="0.01" value={formData.clinic_value} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="hospital_value_neg_modal" className="label-custom">Valor Hospital (R$)</Label>
            <Input id="hospital_value_neg_modal" name="hospital_value" type="number" step="0.01" value={formData.hospital_value} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="materials_value_neg_modal" className="label-custom">Valor Materiais (R$)</Label>
            <Input id="materials_value_neg_modal" name="materials_value" type="number" step="0.01" value={formData.materials_value} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="total_value_neg_modal" className="label-custom">Valor Total (R$)</Label>
            <Input id="total_value_neg_modal" name="total_value" type="number" step="0.01" value={formData.total_value} disabled />
          </div>
          <div>
            <Label htmlFor="observation_neg_modal" className="label-custom">Observação do Paciente / Solicitação</Label>
            <Textarea id="observation_neg_modal" name="observation" value={formData.observation} onChange={handleInputChange} rows={3} />
          </div>
          <div>
            <Label htmlFor="clinic_response_neg_modal" className="label-custom">Resposta da Clínica / Contraproposta</Label>
            <Textarea id="clinic_response_neg_modal" name="clinic_response" value={formData.clinic_response} onChange={handleInputChange} rows={3} />
          </div>
          <div>
            <Label htmlFor="status_neg_modal" className="label-custom">Status da Negociação</Label>
             <select 
                id="status_neg_modal" 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border bg-[hsl(var(--modal-light-input-bg-hsl-values))] px-3 py-2 text-sm text-[hsl(var(--modal-light-input-foreground-hsl))] border-[hsl(var(--modal-light-border-hsl))] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--modal-light-ring-hsl))] focus-visible:ring-offset-2"
              >
              <option value="Em Negociação">Em Negociação</option>
              <option value="Aguardando Aprovação Paciente">Aguardando Aprovação Paciente</option>
              <option value="Aprovado pelo Paciente">Aprovado pelo Paciente</option>
              <option value="Recusado pelo Paciente">Recusado pelo Paciente</option>
              <option value="Aguardando Aprovação Clínica">Aguardando Aprovação Clínica</option>
              <option value="Aprovado pela Clínica">Aprovado pela Clínica</option>
              <option value="Recusado pela Clínica">Recusado pela Clínica</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="btn-frutacor">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Negociação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NegotiationModal;