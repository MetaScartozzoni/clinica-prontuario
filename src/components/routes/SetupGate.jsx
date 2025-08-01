import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#1B1446] to-[#472377]">
    <div className="text-white text-2xl flex items-center">
      <Loader2 className="animate-spin h-8 w-8 mr-3" />
      Verificando configuração do sistema...
    </div>
  </div>
);

const SetupGate = ({ children }) => {
  const [isSetupComplete, setIsSetupComplete] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkSetup = async () => {
      // Primeiro, verificamos o localStorage. É o indicador mais rápido.
      const localSetupStatus = localStorage.getItem('isSetupComplete') === 'true';
      if (localSetupStatus) {
        setIsSetupComplete(true);
        return;
      }

      // Se não estiver no localStorage, consultamos o banco de dados.
      const { data, error } = await supabase.rpc('check_system_setup');

      if (error) {
        console.error('Erro ao verificar a configuração do sistema:', error);
        // Em caso de erro, assumimos que a configuração não está completa para evitar bloqueios.
        setIsSetupComplete(false);
        return;
      }

      const hasAdmin = data.hasAdmin;
      if (hasAdmin) {
        localStorage.setItem('isSetupComplete', 'true');
      }
      setIsSetupComplete(hasAdmin);
    };

    checkSetup();
  }, []);

  if (isSetupComplete === null) {
    return <LoadingScreen />;
  }

  // Se a configuração NÃO está completa, e o usuário NÃO está na página de setup, redirecione para lá.
  if (!isSetupComplete && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  // Se a configuração ESTÁ completa, e o usuário tenta acessar a página de setup, redirecione para o login.
  if (isSetupComplete && location.pathname === '/setup') {
    return <Navigate to="/login" replace />;
  }

  // Em todos os outros casos, permita o acesso à rota solicitada.
  return children;
};

export default SetupGate;