import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ConsultationHistory = ({ history }) => {
  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-violet-300" />
          Histórico Recente
        </CardTitle>
        <CardDescription>Últimos atendimentos do paciente.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <ul className="space-y-3">
            {history.map(record => (
              <li key={record.id} className="p-3 bg-black/20 rounded-md border border-white/10 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-violet-200">{record.conclusion || 'Atendimento Geral'}</span>
                  <span className="text-xs text-violet-400">
                    {format(new Date(record.consultation_timestamp), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Profissional: {record.professional_id?.full_name || 'Não informado'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">Nenhum histórico encontrado.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsultationHistory;