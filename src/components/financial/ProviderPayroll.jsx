import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Loader2, FileText, Eye, Info, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AddEditProviderPaymentModal from '@/components/financial/AddEditProviderPaymentModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const ProviderPayroll = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('financial_service_provider_payments')
        .select('*')
        .order('payment_date', { ascending: false });
      if (fetchError) throw fetchError;
      setPayments(data || []);
    } catch (err) {
      setError("Não foi possível carregar os pagamentos. Tente novamente mais tarde.");
      toast({ title: "Erro ao buscar pagamentos", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAddPayment = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      const { data: paymentToDelete } = await supabase
        .from('financial_service_provider_payments')
        .select('proof_url')
        .eq('id', paymentId)
        .single();

      if (paymentToDelete?.proof_url) {
        const path = paymentToDelete.proof_url.substring(paymentToDelete.proof_url.indexOf('financial-proofs/') + 'financial-proofs/'.length);
        await supabase.storage.from('financial-proofs').remove([path]);
      }

      const { error: deleteError } = await supabase.from('financial_service_provider_payments').delete().eq('id', paymentId);
      if (deleteError) throw deleteError;
      toast({ title: "Pagamento excluído", description: "O registro do pagamento e seu comprovante foram removidos.", variant: "success" });
      fetchPayments(); 
    } catch (err) {
      toast({ title: "Erro ao excluir pagamento", description: err.message, variant: "destructive" });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="custom-card w-full min-h-[400px] flex flex-col">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="card-title-custom">Folha de Pagamento - Prestadores</CardTitle>
            <CardDescription className="text-card-foreground/80">Gerencie os pagamentos feitos a prestadores de serviço.</CardDescription>
          </div>
          <Button onClick={handleAddPayment} className="btn-frutacor">
            <PlusCircle className="mr-2 h-5 w-5" /> Registrar Pagamento
          </Button>
        </CardHeader>
        <CardContent className="flex-grow p-6">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">Carregando pagamentos...</p>
              <p className="text-sm">Por favor, aguarde.</p>
            </div>
          ) : error ? (
             <div className="flex flex-col justify-center items-center h-full text-destructive text-center">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">Erro ao Carregar</p>
                <p className="mb-4">{error}</p>
                <Button onClick={fetchPayments} variant="outline">Tentar Novamente</Button>
             </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-center">
              <Info className="h-12 w-12 mb-4 text-primary" />
              <p className="text-lg font-semibold">Nenhum Pagamento Registrado</p>
              <p>Clique em "Registrar Pagamento" para adicionar o primeiro.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prestador</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Comprovante</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {payments.map((payment) => (
                      <motion.tr 
                        key={payment.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-muted/10"
                      >
                        <TableCell className="font-medium">{payment.provider_name}</TableCell>
                        <TableCell>{payment.service_description}</TableCell>
                        <TableCell className="text-right">R$ {parseFloat(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>{format(new Date(payment.payment_date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'Pago' ? 'bg-green-600/30 text-green-300' :
                            payment.status === 'Pendente' ? 'bg-yellow-600/30 text-yellow-300' :
                            payment.status === 'Atrasado' ? 'bg-red-600/30 text-red-300' :
                            'bg-gray-600/30 text-gray-300'
                          }`}>
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {payment.proof_url ? (
                            <Button asChild variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                              <a href={payment.proof_url} target="_blank" rel="noopener noreferrer" title={payment.proof_file_name || 'Ver comprovante'}>
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditPayment(payment)} className="text-blue-400 hover:text-blue-300" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" title="Excluir">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="modal-light-theme">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dialog-title-custom">Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription className="dialog-description-custom">
                                  Tem certeza que deseja excluir o registro de pagamento para "{payment.provider_name}" no valor de R$ {parseFloat(payment.amount).toLocaleString('pt-BR')}? Esta ação não pode ser desfeita e o comprovante associado (se houver) também será removido.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePayment(payment.id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <AddEditProviderPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          payment={selectedPayment}
          onSave={() => {
            setIsModalOpen(false);
            fetchPayments();
          }}
        />
      )}
    </motion.div>
  );
};

export default ProviderPayroll;