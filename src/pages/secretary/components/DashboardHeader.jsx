import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import NotificationsPanel from '@/components/layouts/NotificationsPanel';
import { useToast } from '@/components/ui/use-toast';

const DashboardHeader = () => {
  const { toast } = useToast();

  const handleShareLink = () => {
    const link = `${window.location.origin}/cadastro-paciente`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copiado!',
      description: 'O link de cadastro de paciente foi copiado para a área de transferência.',
      variant: 'success',
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard da Secretaria</h1>
        <p className="text-muted-foreground">Gerencie agendamentos, pacientes e comunicações.</p>
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button onClick={handleShareLink} variant="outline" className="flex-1 md:flex-none">
          <Share2 className="mr-2 h-4 w-4" />
          Link de Cadastro
        </Button>
        <NotificationsPanel />
      </div>
    </div>
  );
};

export default DashboardHeader;