import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Loader2, CalendarClock, MessageCircle } from 'lucide-react';

const SurgeryDateModal = ({ isOpen, onClose, onSubmit, patientName }) => {
  const [surgeryDate, setSurgeryDate] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [isSubmittingDate, setIsSubmittingDate] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingDate(true);
    onSubmit(surgeryDate, paymentInstructions);
  };
  
  useEffect(() => {
    if(isOpen) {
      setSurgeryDate('');
      setPaymentInstructions('');
      setIsSubmittingDate(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-light-theme">
        <DialogHeader>
          <DialogTitle className="dialog-title-custom flex items-center">
            <CalendarClock className="mr-2 h-6 w-6"/> Confirmar Orçamento Aceito
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Paciente: {patientName}. Defina a data da cirurgia e as instruções de pagamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="probable_surgery_date_modal_field" className="label-custom">Data Provável da Cirurgia *</Label>
            <Input 
              id="probable_surgery_date_modal_field" 
              type="date" 
              value={surgeryDate} 
              onChange={(e) => setSurgeryDate(e.target.value)}
              required 
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <Label htmlFor="payment_instructions_modal_field" className="label-custom">
              <MessageCircle className="inline mr-1 h-4 w-4"/> Instruções de Pagamento (Opcional)
            </Label>
            <Textarea
              id="payment_instructions_modal_field"
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              placeholder="Ex: Sinal de 30% até DD/MM/YYYY. Restante em 3x no cartão."
              rows={3}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmittingDate}>Cancelar</Button></DialogClose>
            <Button type="submit" className="btn-frutacor" disabled={!surgeryDate || isSubmittingDate}>
              {isSubmittingDate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-2 h-4 w-4" />}
              Confirmar e Integrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SurgeryDateModal;