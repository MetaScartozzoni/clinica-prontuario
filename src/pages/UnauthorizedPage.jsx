import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#1B1446] to-[#472377] text-white p-4">
      <ShieldAlert className="h-24 w-24 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold mb-2">Acesso Negado</h1>
      <p className="text-lg text-violet-300 mb-8 text-center max-w-md">
        Você não tem permissão para acessar esta página.
      </p>
      <Button asChild>
        <Link to="/login">Voltar para o Login</Link>
      </Button>
    </div>
  );
};

export default UnauthorizedPage;