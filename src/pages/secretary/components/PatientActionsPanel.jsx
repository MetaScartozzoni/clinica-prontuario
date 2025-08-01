import React from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, MessageSquare, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PatientActionsPanel = ({ patient }) => {
  const { toast } = useToast();

  const handleAction = (actionName) => {
    toast({
      title: `Ação: ${actionName}`,
      description: `Funcionalidade para "${actionName}" não implementada.`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => handleAction('Enviar Documento')}>
        <FileUp className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleAction('Enviar Mensagem')}>
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleAction('Registrar Ligação')}>
        <Phone className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PatientActionsPanel;