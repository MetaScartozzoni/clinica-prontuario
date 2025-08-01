import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const RequestExamModal = ({ isOpen, onClose, onSubmit }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    exam_type: '',
    request_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.exam_type) {
      toast({ title: "Campo obrigatório", description: "Por favor, informe o tipo do exame.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    const success = await onSubmit(formData);
    setIsSubmitting(false);

    if (success) {
      setFormData({
        exam_type: '',
        request_date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Solicitar Novo Exame</DialogTitle>
          <DialogDescription>Preencha os detalhes do exame a ser solicitado.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam_type">Tipo do Exame</Label>
            <Input id="exam_type" placeholder="Ex: Hemograma completo, Ressonância Magnética" value={formData.exam_type} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="request_date">Data da Solicitação</Label>
            <Input id="request_date" type="date" value={formData.request_date} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea id="notes" placeholder="Ex: Em jejum de 8 horas, urgência." value={formData.notes} onChange={handleChange} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestExamModal;