import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CompanyCashTransferHistory = ({ history }) => {
  if (history.length === 0) {
    return <p className="text-card-foreground/70">Nenhuma transferência registrada.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-card-foreground/90">Data</TableHead>
            <TableHead className="text-card-foreground/90">Tipo</TableHead>
            <TableHead className="text-card-foreground/90">Descrição</TableHead>
            <TableHead className="text-right text-card-foreground/90">Valor</TableHead>
            <TableHead className="text-center text-card-foreground/90">Autorizado por</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((tx) => (
            <TableRow key={tx.id} className="hover:bg-card-foreground/5">
              <TableCell className="text-card-foreground/80">
                {tx.transaction_date ? format(parseISO(tx.transaction_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell className="text-card-foreground/80">
                <Badge variant={tx.description === 'Transferência para Caixa da Empresa' ? 'default' : 'secondary'} className="flex items-center gap-1 w-min">
                  <ArrowRightLeft className="h-3 w-3" />
                  {tx.description === 'Transferência para Caixa da Empresa' ? 'Entrada no Caixa' : 'Saída do Caixa'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-card-foreground">{tx.notes || 'N/A'}</TableCell>
              <TableCell className={`text-right font-semibold ${tx.description === 'Transferência para Caixa da Empresa' ? 'text-red-400' : 'text-green-400'}`}>
                R$ {tx.amount ? tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
              </TableCell>
              <TableCell className="text-center text-card-foreground/80">{tx.responsible_user_id || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompanyCashTransferHistory;