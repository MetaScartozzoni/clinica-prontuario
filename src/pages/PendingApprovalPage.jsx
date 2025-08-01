import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Hourglass } from 'lucide-react';

const PendingApprovalPage = () => {
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#1B1446] to-[#472377] text-white p-4">
      <Hourglass className="h-24 w-24 text-blue-400 mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold mb-2">Aguardando Aprovação</h1>
      <p className="text-lg text-violet-300 mb-8 text-center max-w-md">
        Sua conta foi criada e está aguardando aprovação de um administrador. Você será notificado por e-mail quando for aprovada.
      </p>
      <Button onClick={signOut}>
        Voltar para o Login
      </Button>
    </div>
  );
};

export default PendingApprovalPage;