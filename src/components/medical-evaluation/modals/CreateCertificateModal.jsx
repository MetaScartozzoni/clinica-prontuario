import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CreateCertificateModal = ({ isOpen, onClose, onSubmit, patientName }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cid: '',
    days: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.days || !formData.reason) {
      toast({ title: "Campos obrigatórios", description: "Preencha os dias de afastamento e o motivo.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    // In a real app, this would likely call a backend function to generate a PDF
    // For now, we just pass the data up.
    await onSubmit(formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Emitir Atestado Médico</DialogTitle>
          <DialogDescription>Atestado para o paciente: {patientName}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cid">CID-10 (Opcional)</Label>
              <Input id="cid" placeholder="Ex: J00" value={formData.cid} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Dias de Afastamento</Label>
              <Input id="days" type="number" placeholder="Ex: 3" value={formData.days} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo/Finalidade</Label>
            <Textarea id="reason" placeholder="Ex: Para fins de afastamento do trabalho por motivo de doença." value={formData.reason} onChange={handleChange} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Gerar Atestado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCertificateModal;