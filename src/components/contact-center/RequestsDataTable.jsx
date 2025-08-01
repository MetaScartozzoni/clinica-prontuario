import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check, X, Trash2 } from 'lucide-react';
import useAuthRole from '@/hooks/useAuthRole';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusVariant = {
  pending_approval: 'bg-yellow-500 text-black',
  approved: 'bg-green-500',
  denied: 'bg-red-600',
  rescheduled: 'bg-blue-500',
  completed: 'bg-gray-700',
  canceled: 'bg-gray-500',
};

const priorityVariant = {
  low: 'bg-green-200 text-green-800',
  medium: 'bg-blue-200 text-blue-800',
  high: 'bg-yellow-200 text-yellow-800',
  urgent: 'bg-red-200 text-red-800',
};

const RequestsDataTable = ({ data, onStatusChange, onDelete }) => {
  const { hasRole } = useAuthRole();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  const isDoctor = hasRole('medico');
  const canDelete = hasRole(['admin_financeiro', 'comercial']);

  const handleAction = (action, requestId, reason = null) => {
    setActionToConfirm({ action, requestId, reason });
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!actionToConfirm) return;
    const { action, requestId, reason } = actionToConfirm;
    
    if (action === 'delete') {
      onDelete(requestId);
    } else {
      onStatusChange(requestId, action, reason);
    }
    setDialogOpen(false);
    setActionToConfirm(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Agendado Para</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.patient?.name || 'N/A'}</TableCell>
                  <TableCell>{request.doctor?.full_name || 'N/A'}</TableCell>
                  <TableCell>{request.subject}</TableCell>
                  <TableCell>{request.scheduled_for ? new Date(request.scheduled_for).toLocaleString('pt-BR') : 'Aguardando'}</TableCell>
                  <TableCell>
                    <Badge className={statusVariant[request.status]}>{request.status.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityVariant[request.priority]}>{request.priority}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isDoctor && request.status === 'pending_approval' && (
                          <>
                            <DropdownMenuItem onClick={() => handleAction('approved', request.id)}>
                              <Check className="mr-2 h-4 w-4 text-green-500" /> Aprovar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                const reason = prompt("Por favor, insira o motivo da recusa:");
                                if (reason) handleAction('denied', request.id, reason);
                            }}>
                              <X className="mr-2 h-4 w-4 text-red-500" /> Negar
                            </DropdownMenuItem>
                          </>
                        )}
                        {canDelete && (
                          <DropdownMenuItem onClick={() => handleAction('delete', request.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="7" className="h-24 text-center">
                  Nenhuma solicitação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja {actionToConfirm?.action === 'delete' ? 'excluir' : 'executar'} esta ação?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionToConfirm(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RequestsDataTable;