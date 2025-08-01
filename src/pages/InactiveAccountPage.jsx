import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

const InactiveAccountPage = () => {
  const { signOut } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#1B1446] to-[#472377] text-white p-4">
      <UserX className="h-24 w-24 text-yellow-500 mb-6" />
      <h1 className="text-4xl font-bold mb-2">Conta Inativa</h1>
      <p className="text-lg text-violet-300 mb-8 text-center max-w-md">
        Sua conta foi desativada. Por favor, entre em contato com o suporte para mais informações.
      </p>
      <Button onClick={signOut}>
        Voltar para o Login
      </Button>
    </div>
  );
};

export default InactiveAccountPage;