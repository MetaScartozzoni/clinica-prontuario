import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const QuotesTable = ({ quotes, onUpdateStatus, onView, onEdit, onDelete, onSendMessage }) => {
  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Nenhum orçamento encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-semibold text-orange-600">ID</TableHead>
            <TableHead className="font-semibold text-orange-600">Paciente</TableHead>
            <TableHead className="font-semibold text-orange-600">Procedimento</TableHead>
            <TableHead className="font-semibold text-orange-600">Data</TableHead>
            <TableHead className="font-semibold text-orange-600">Valor</TableHead>
            <TableHead className="font-semibold text-orange-600">Status</TableHead>
            <TableHead className="text-right font-semibold text-orange-600">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote, index) => (
            <motion.tr 
              key={quote.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-muted/30 transition-colors"
            >
              <TableCell className="font-medium text-xs">{quote.id.substring(0,8)}</TableCell>
              <TableCell>{quote.patient_name || 'N/A'}</TableCell>
              <TableCell>{quote.custom_surgery_name || quote.surgery_type?.name || 'N/A'}</TableCell>
              <TableCell>{new Date(quote.budget_date + 'T00:00:00').toLocaleDateString()}</TableCell>
              <TableCell className="font-semibold">{quote.total_value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
              <TableCell>
                <select 
                    value={quote.status} 
                    onChange={(e) => onUpdateStatus(quote, e.target.value)}
                    className="p-1 text-xs border rounded-md bg-transparent hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary"
                >
                    <option value="Pendente">Pendente</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Aceito">Aceito</option>
                    <option value="Recusado">Recusado</option>
                    <option value="Em Negociação">Em Negociação</option>
                </select>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onSendMessage(quote)} title="Enviar Mensagem">
                    <Send className="h-5 w-5 text-green-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onView(quote.id)} title="Ver Detalhes">
                    <Eye className="h-5 w-5 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(quote)} title="Editar">
                    <Edit className="h-5 w-5 text-yellow-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(quote.id)} title="Excluir">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotesTable;