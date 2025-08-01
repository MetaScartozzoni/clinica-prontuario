import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CreatePrescriptionModal = ({ isOpen, onClose, onSubmit }) => {
  const { toast } = useToast();
  const [medications, setMedications] = useState([{ name: '', dosage: '', instructions: '' }]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', instructions: '' }]);
  };

  const removeMedication = (index) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
  };

  const handleSubmit = async () => {
    const validMedications = medications.filter(med => med.name && med.instructions);
    if (validMedications.length === 0) {
      toast({ title: "Receita Inválida", description: "Adicione pelo menos um medicamento com nome e instruções.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    const success = await onSubmit({ medications: validMedications, notes });
    setIsSubmitting(false);

    if (success) {
      setMedications([{ name: '', dosage: '', instructions: '' }]);
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Emitir Nova Receita Médica</DialogTitle>
          <DialogDescription>Preencha os medicamentos, dosagens e instruções para o paciente.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {medications.map((med, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/50 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`med-name-${index}`}>Medicamento</Label>
                  <Input id={`med-name-${index}`} placeholder="Ex: Dipirona" value={med.name} onChange={e => handleMedicationChange(index, 'name', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor={`med-dosage-${index}`}>Dosagem</Label>
                  <Input id={`med-dosage-${index}`} placeholder="Ex: 500mg" value={med.dosage} onChange={e => handleMedicationChange(index, 'dosage', e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor={`med-instructions-${index}`}>Instruções de Uso</Label>
                <Textarea id={`med-instructions-${index}`} placeholder="Ex: 1 comprimido a cada 6 horas por 3 dias, se houver dor." value={med.instructions} onChange={e => handleMedicationChange(index, 'instructions', e.target.value)} rows={2} />
              </div>
              {medications.length > 1 && (
                <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeMedication(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addMedication}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Medicamento
          </Button>

          <div className="border-t pt-4">
            <Label htmlFor="general-notes">Observações Gerais</Label>
            <Textarea id="general-notes" placeholder="Orientações adicionais, como repouso, alimentação, etc." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar e Emitir Receita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePrescriptionModal;