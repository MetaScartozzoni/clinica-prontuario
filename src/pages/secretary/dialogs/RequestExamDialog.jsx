import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const RequestExamDialog = ({ isOpen, onClose }) => {
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: "A solicitação de exames será implementada em breve.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Exame</DialogTitle>
          <DialogDescription>Esta funcionalidade ainda não foi implementada.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Em breve, você poderá solicitar exames para os pacientes diretamente por aqui.</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleNotImplemented}>Entendido</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestExamDialog;