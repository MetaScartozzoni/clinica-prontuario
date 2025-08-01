import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ShareLinkFormDialog = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const registrationLink = `${window.location.origin}/register-patient`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registrationLink);
    toast({
      title: 'Link Copiado!',
      description: 'O link foi copiado para sua área de transferência.',
      variant: 'success',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartilhar Link de Cadastro</DialogTitle>
          <DialogDescription>
            Envie este link para que os pacientes possam se cadastrar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={registrationLink} readOnly />
          </div>
          <Button type="button" size="icon" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareLinkFormDialog;