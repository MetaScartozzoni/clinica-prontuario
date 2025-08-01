import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DomainMismatchNotifier = () => {
  const { userRole } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [expectedUrl, setExpectedUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (userRole !== 'admin_financeiro') {
      return;
    }

    const checkDomain = async () => {
      const { data, error } = await supabase
        .from('system_parameters')
        .select('parameter_value')
        .eq('parameter_key', 'expected_production_url')
        .single();

      if (error || !data) {
        console.warn('Could not fetch expected_production_url parameter.');
        return;
      }

      const expected = data.parameter_value;
      const current = window.location.origin;

      setExpectedUrl(expected);
      setCurrentUrl(current);
      
      if (expected && current && expected !== current) {
        setShowWarning(true);
      }
    };

    checkDomain();
  }, [userRole]);

  if (!showWarning) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6 border-2 border-destructive/80 shadow-lg">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="font-extrabold text-lg">Alerta de Configuração de Domínio</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          O sistema está sendo acessado de uma URL (<strong className="font-mono">{currentUrl}</strong>) que não corresponde à URL de produção configurada (<strong className="font-mono">{expectedUrl}</strong>).
        </p>
        <p className="mb-4">
          Isso pode causar falhas no login, cadastro e outras funcionalidades. Por favor, atualize as URLs no Supabase e Google Cloud para o domínio correto.
        </p>
        <Button asChild variant="outline" className="bg-white text-destructive hover:bg-white/90">
          <Link to="/settings?tab=auth">
            <Settings className="mr-2 h-4 w-4" />
            Ver Guias de Configuração e Corrigir
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default DomainMismatchNotifier;