import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Repeat } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CashFlowTable = ({ transactions }) => {
  const getTransactionTypeIcon = (type, description) => {
    if (description === 'Transferência para Caixa da Empresa' || description === 'Transferência do Caixa da Empresa') {
      return <Repeat className="h-4 w-4 text-blue-500" />;
    }
    return type === 'Entrada' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-card-foreground/90">Data</TableHead>
            <TableHead className="text-card-foreground/90">Tipo</TableHead>
            <TableHead className="text-card-foreground/90">Descrição/Notas</TableHead>
            <TableHead className="text-card-foreground/90">Relacionado a</TableHead>
            <TableHead className="text-right text-card-foreground/90">Valor</TableHead>
            <TableHead className="text-center text-card-foreground/90">Responsável</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="hover:bg-card-foreground/5">
              <TableCell className="text-card-foreground/80">
                {tx.payment_date ? format(parseISO(tx.payment_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : (tx.transaction_date ? format(parseISO(tx.transaction_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-')}
              </TableCell>
              <TableCell className="text-card-foreground/80">
                <Badge variant={tx.transaction_type === 'Entrada' ? 'success' : 'destructive'} className="flex items-center gap-1 w-min">
                  {getTransactionTypeIcon(tx.transaction_type, tx.description)}
                  {tx.transaction_type}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-card-foreground">
                {tx.description || 'N/A'}
                {tx.notes && <p className="text-xs text-card-foreground/70 mt-1">{tx.notes}</p>}
              </TableCell>
              <TableCell className="text-card-foreground/80">{tx.patient_name || tx.related_entity_type || '-'}</TableCell>
              <TableCell className={`text-right font-semibold ${tx.transaction_type === 'Entrada' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.amount ? `R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
              </TableCell>
              <TableCell className="text-center text-card-foreground/80">{tx.responsible_user_id || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CashFlowTable;