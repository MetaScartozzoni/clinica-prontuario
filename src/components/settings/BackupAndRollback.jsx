import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { HardDriveDownload, AlertTriangle, RotateCcw } from 'lucide-react';
import Papa from 'papaparse';

const BackupAndRollback = () => {
  const { toast } = useToast();

  const handleBackup = async (tableName) => {
    // Verifica se o cliente Supabase está inicializado
    if (!supabase) {
      toast({
        title: 'Integração Supabase Pendente',
        description: 'Por favor, complete a integração do Supabase para usar a funcionalidade de backup.',
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Iniciando Backup...', description: `Exportando dados da tabela ${tableName}.` });
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;

      if (!data || data.length === 0) {
        toast({ title: 'Tabela Vazia', description: `A tabela ${tableName} não possui dados para exportar.`, variant: 'default' });
        return;
      }

      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${tableName}_backup_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: 'Backup Concluído!', description: `Dados de ${tableName} exportados com sucesso.`, variant: 'success' });

    } catch (err) {
      console.error(`Erro ao fazer backup de ${tableName}:`, err);
      toast({ title: `Erro no Backup de ${tableName}`, description: err.message, variant: 'destructive' });
    }
  };

  const tablesToBackup = [
    { name: 'patients', label: 'Pacientes' },
    { name: 'profiles', label: 'Perfis' },
    { name: 'appointments', label: 'Agendamentos' },
    { name: 'surgery_schedule', label: 'Cirurgias' },
    { name: 'inventory', label: 'Inventário' },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDriveDownload /> Backup de Dados
        </CardTitle>
        <CardDescription>Exporte os dados críticos da clínica para arquivos CSV como medida de segurança.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tablesToBackup.map((table) => (
            <Button key={table.name} variant="outline" onClick={() => handleBackup(table.name)}>
              Exportar {table.label}
            </Button>
          ))}
        </div>
        <div className="p-4 bg-secondary/30 border-l-4 border-secondary rounded-r-lg">
          <div className="flex items-start">
            <RotateCcw className="h-6 w-6 mr-3 mt-1 text-secondary-foreground" />
            <div>
              <h4 className="font-semibold text-secondary-foreground">Funcionalidade de Restauração (Rollback)</h4>
              <p className="text-sm text-secondary-foreground/80">
                A funcionalidade de restauração (rollback) a partir de um backup ainda não está implementada. Entre em contato com o suporte para assistência em caso de necessidade de restauração de dados.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackupAndRollback;