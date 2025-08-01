import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserPlus } from 'lucide-react';

const leadClassifications = [
  "Lead Quente (Alta Urgência)",
  "Lead Morno (Interesse Médio)",
  "Lead Frio (Baixa Urgência)",
  "Contato Futuro",
  "Sem Interesse Atual",
  "Paciente Existente (Retorno)",
  "Indicação",
  "Outro",
];

const AddManualPatientModal = ({ isOpen, onClose, onPatientAdded, initialData }) => {
  const { toast } = useToast();
  const initialFormState = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    cpf: '',
    important_notes: '',
    lead_classification: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || initialFormState);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, lead_classification: value }));
  };

  const validateCpf = (cpf) => {
    if (!cpf) return true; // CPF is optional
    const cleanedCpf = cpf.replace(/\D/g, '');
    return cleanedCpf.length === 11;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.phone) {
      toast({ title: "Campos Obrigatórios", description: "Nome e Telefone são obrigatórios.", variant: "destructive" });
      return;
    }
    
    if (formData.cpf && !validateCpf(formData.cpf)) {
      toast({
        title: "CPF Inválido",
        description: "O CPF informado não possui 11 dígitos. Por favor, verifique ou continue o cadastro para ajustar depois.",
        variant: "warning",
        duration: 6000
      });
      // Do not return, allow submission as per user request
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.rpc('create_patient_with_duplicate_check', {
      p_first_name: formData.first_name,
      p_last_name: formData.last_name,
      p_phone: formData.phone,
      p_email: formData.email || null,
      p_dob: formData.dob || null,
      p_cpf: formData.cpf || null
    });

    if (error) {
      toast({ title: "Erro ao Salvar Paciente", description: `Detalhe: ${error.message}`, variant: "destructive" });
    } else {
      const result = data[0];
      const patientName = `${result.first_name || ''} ${result.last_name || ''}`.trim();
      
      if (result.is_new) {
        toast({ title: "Paciente Adicionado!", description: `${patientName} foi cadastrado com sucesso.`, variant: "success" });
      } else {
        toast({ title: "Paciente Encontrado!", description: `Já existe um cadastro para ${patientName}. As informações foram atualizadas.`, variant: "default" });
      }

      if (onPatientAdded) {
        const patientResult = {
          id: result.id,
          first_name: result.first_name,
          last_name: result.last_name,
          name: patientName,
        };
        onPatientAdded(patientResult);
      }
      onClose();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg modal-dark-theme">
        <DialogHeader>
          <DialogTitle className="flex items-center dialog-title-custom">
            <UserPlus className="mr-2 h-6 w-6 text-primary" /> Adicionar Novo Paciente
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Preencha os dados. O sistema verificará por duplicatas antes de criar um novo cadastro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="label-custom">Nome *</Label>
              <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="input-light-theme"/>
            </div>
            <div>
              <Label htmlFor="last_name" className="label-custom">Sobrenome</Label>
              <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleInputChange} className="input-light-theme"/>
            </div>
            <div>
              <Label htmlFor="patient_phone_manual_modal" className="label-custom">Telefone *</Label>
              <Input id="patient_phone_manual_modal" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required className="input-light-theme"/>
            </div>
            <div>
              <Label htmlFor="patient_email_manual_modal" className="label-custom">Email</Label>
              <Input id="patient_email_manual_modal" name="email" type="email" value={formData.email} onChange={handleInputChange} className="input-light-theme"/>
            </div>
            <div>
              <Label htmlFor="patient_dob_manual_modal" className="label-custom">Data de Nascimento</Label>
              <Input id="patient_dob_manual_modal" name="dob" type="date" value={formData.dob} onChange={handleInputChange} className="input-light-theme"/>
            </div>
             <div>
              <Label htmlFor="patient_cpf_manual_modal" className="label-custom">CPF</Label>
              <Input id="patient_cpf_manual_modal" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="###.###.###-##" className="input-light-theme"/>
            </div>
            <div>
                <Label htmlFor="lead_classification_manual_modal" className="label-custom">Classificação do Lead</Label>
                <Select value={formData.lead_classification} onValueChange={handleSelectChange}>
                    <SelectTrigger id="lead_classification_manual_modal" className="select-trigger-custom">
                        <SelectValue placeholder="Selecione a classificação" />
                    </SelectTrigger>
                    <SelectContent className="select-content-custom">
                        {leadClassifications.map(classification => (
                            <SelectItem key={classification} value={classification} className="select-item-custom">
                                {classification}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="patient_notes_manual_modal" className="label-custom">Observações Importantes</Label>
            <Textarea id="patient_notes_manual_modal" name="important_notes" value={formData.important_notes} onChange={handleInputChange} rows={3} className="textarea-light-theme"/>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="btn-frutacor">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Paciente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddManualPatientModal;