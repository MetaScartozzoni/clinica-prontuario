import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { HeartPulse, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const SystemHealth = () => {
  const [status, setStatus] = useState({
    dbConnection: 'checking',
    supabaseUrl: 'checking',
    supabaseAnonKey: 'checking'
  });

  useEffect(() => {
    const checkSystemHealth = async () => {
      // Check DB Connection
      try {
        const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
        if (error) throw error;
        setStatus(prev => ({ ...prev, dbConnection: 'ok' }));
      } catch (error) {
        setStatus(prev => ({ ...prev, dbConnection: 'error' }));
      }

      // Check Supabase URL
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL.startsWith('https')) {
        setStatus(prev => ({ ...prev, supabaseUrl: 'ok' }));
      } else {
        setStatus(prev => ({ ...prev, supabaseUrl: 'error' }));
      }
      
      // Check Supabase Anon Key
      if (import.meta.env.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY.length > 50) {
        setStatus(prev => ({ ...prev, supabaseAnonKey: 'ok' }));
      } else {
        setStatus(prev => ({ ...prev, supabaseAnonKey: 'error' }));
      }
    };
    checkSystemHealth();
  }, []);

  const StatusIndicator = ({ check }) => {
    if (check === 'checking') {
      return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }
    if (check === 'ok') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-destructive" />;
  };

  const healthChecks = [
    { key: 'dbConnection', label: 'Conexão com Banco de Dados', status: status.dbConnection },
    { key: 'supabaseUrl', label: 'VITE_SUPABASE_URL Configurada', status: status.supabaseUrl },
    { key: 'supabaseAnonKey', label: 'VITE_SUPABASE_ANON_KEY Configurada', status: status.supabaseAnonKey },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartPulse /> Saúde do Sistema
        </CardTitle>
        <CardDescription>Verificação automática do estado dos principais serviços e configurações do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {healthChecks.map(check => (
            <li key={check.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <span className="font-medium">{check.label}</span>
              <StatusIndicator check={check.status} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SystemHealth;