import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

const CompanyCashTransferModal = ({ isOpen, onClose, onSave, transferType, currentBalance, userId, companyCashConfigId }) => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isWithdrawal = transferType === 'from_company_cash';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const transferAmount = parseFloat(amount);
    
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({ title: "Valor Inválido", description: "Por favor, insira um valor numérico positivo.", variant: "destructive" });
      return;
    }
    if (isWithdrawal && transferAmount > currentBalance) {
      toast({ title: "Saldo Insuficiente", description: `Você não pode retirar mais do que o saldo atual de R$ ${currentBalance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('transfer_company_cash', {
        p_amount: transferAmount,
        p_transfer_type: transferType,
        p_user_id: userId,
        p_config_id: companyCashConfigId
      });
      if (error) throw error;
      
      toast({ title: "Transferência Realizada!", description: "A transferência foi registrada com sucesso.", variant: "success" });
      onSave(); // This calls the success handler passed via props
    } catch (error) {
      console.error("Erro na transferência:", error);
      toast({ title: "Erro na Transferência", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg modal-light-theme">
        <DialogHeader>
          <DialogTitle className="flex items-center dialog-title-custom">
            <ArrowRightLeft className="mr-2 h-6 w-6 text-primary" />
            {isWithdrawal ? 'Retirar do Caixa da Empresa' : 'Transferir para Caixa da Empresa'}
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            {isWithdrawal
              ? 'O valor será movido do Caixa da Empresa para o Fluxo de Caixa geral.'
              : 'O valor será movido do Fluxo de Caixa geral para o Caixa da Empresa.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {isWithdrawal && (
            <div className="flex items-center space-x-2 bg-yellow-100/60 p-3 rounded-md border border-yellow-300">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Atenção: O saldo atual do Caixa da Empresa é de R$ {currentBalance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.
              </p>
            </div>
          )}
          <div>
            <Label htmlFor="transfer_amount_modal" className="label-custom">Valor da Transferência (R$) *</Label>
            <Input
              id="transfer_amount_modal"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 5000.00"
              required
            />
          </div>
          <div>
            <Label htmlFor="transfer_notes" className="label-custom">Observação (Opcional)</Label>
            <Textarea 
              id="transfer_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Adiantamento para pagamento de fornecedor"
            />
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !amount} className="btn-frutacor">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Transferência
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyCashTransferModal;