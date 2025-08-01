import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SendDocumentDialog = ({ isOpen, onClose }) => {
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: "O envio de documentos será implementado em breve.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
          <DialogDescription>Esta funcionalidade ainda não foi implementada.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Em breve, você poderá enviar documentos para os pacientes diretamente por aqui, integrado ao BotConversa.</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleNotImplemented}>Entendido</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendDocumentDialog;