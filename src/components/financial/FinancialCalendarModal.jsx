import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import useAuthRole from '@/hooks/useAuthRole';
import { format, parseISO } from 'date-fns';

const transactionStatuses = ["Pendente", "Pago", "Em Aberto", "Atrasado", "Cancelado"];
const transactionCategories = ["Conta a Pagar", "Conta a Receber", "Pagamento de Fornecedor", "Receita de Paciente", "Imposto", "Investimento", "Outra Receita", "Outra Despesa"];
const transactionTypes = ["Entrada", "Saída"];
const paymentTypes = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Transferência", "Dinheiro"];

const FinancialCalendarModal = ({ isOpen, onClose, event, onSave, onDelete }) => {
  const [formData, setFormData] = useState({});
  const { toast } = useToast();
  const { hasRole } = useAuthRole();

  const canEdit = hasRole('admin_financeiro');

  useEffect(() => {
    if (event) {
      const resource = event.resource || event;
      setFormData({
        id: resource.id || null,
        transaction_date: resource.transaction_date ? format(parseISO(resource.transaction_date), 'yyyy-MM-dd') : (resource.start ? format(new Date(resource.start), 'yyyy-MM-dd') : ''),
        payment_date: resource.payment_date ? format(parseISO(resource.payment_date), 'yyyy-MM-dd') : '',
        due_date: resource.due_date ? format(parseISO(resource.due_date), 'yyyy-MM-dd') : '',
        transaction_type: resource.transaction_type || 'Saída',
        amount: resource.amount || '',
        category: resource.category || '',
        description: resource.description || '',
        notes: resource.notes || '',
        status: resource.status || 'Pendente',
        patient_name: resource.patient_name || '',
        related_entity_type: resource.related_entity_type || '',
        discount: resource.discount || '',
        commission: resource.commission || '',
        installments: resource.installments || '',
        payment_type: resource.payment_type || '',
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.transaction_date || !formData.amount || !formData.transaction_type || !formData.description) {
      toast({ title: 'Campos obrigatórios', description: 'Data, Valor, Tipo e Descrição são obrigatórios.', variant: 'destructive' });
      return;
    }
    const success = await onSave({
      ...formData,
      transaction_date: new Date(formData.transaction_date).toISOString(),
      payment_date: formData.payment_date ? new Date(formData.payment_date).toISOString() : null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
    });
    if (success) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (formData.id) {
      const success = await onDelete(formData.id);
      if (success) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
          <DialogDescription>
            {canEdit ? 'Preencha os detalhes da transação.' : 'Visualizando detalhes da transação.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição*</Label>
            <Input id="description" name="description" value={formData.description || ''} onChange={handleChange} disabled={!canEdit} placeholder="Ex: Consulta Dr. João" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor (R$)*</Label>
              <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount || ''} onChange={handleChange} disabled={!canEdit} placeholder="150.00" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discount">Desconto (R$)</Label>
              <Input id="discount" name="discount" type="number" step="0.01" value={formData.discount || ''} onChange={handleChange} disabled={!canEdit} placeholder="0.00" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commission">Comissão (R$)</Label>
              <Input id="commission" name="commission" type="number" step="0.01" value={formData.commission || ''} onChange={handleChange} disabled={!canEdit} placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="transaction_date">Data da Transação*</Label>
              <Input id="transaction_date" name="transaction_date" type="date" value={formData.transaction_date || ''} onChange={handleChange} disabled={!canEdit} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input id="due_date" name="due_date" type="date" value={formData.due_date || ''} onChange={handleChange} disabled={!canEdit} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_date">Data de Pagamento</Label>
              <Input id="payment_date" name="payment_date" type="date" value={formData.payment_date || ''} onChange={handleChange} disabled={!canEdit} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="transaction_type">Tipo*</Label>
              <Select name="transaction_type" value={formData.transaction_type} onValueChange={(v) => handleSelectChange('transaction_type', v)} disabled={!canEdit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {transactionTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status*</Label>
              <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)} disabled={!canEdit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {transactionStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_type">Forma de Pagamento</Label>
              <Select name="payment_type" value={formData.payment_type} onValueChange={(v) => handleSelectChange('payment_type', v)} disabled={!canEdit}>
                <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                <SelectContent>
                  {paymentTypes.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select name="category" value={formData.category} onValueChange={(v) => handleSelectChange('category', v)} disabled={!canEdit}>
                <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                <SelectContent>
                  {transactionCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Input id="installments" name="installments" type="number" value={formData.installments || ''} onChange={handleChange} disabled={!canEdit} placeholder="1" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="patient_name">Paciente/Entidade Relacionada</Label>
            <Input id="patient_name" name="patient_name" value={formData.patient_name || ''} onChange={handleChange} disabled={!canEdit} placeholder="Ex: João da Silva" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} disabled={!canEdit} placeholder="Detalhes adicionais sobre a transação..." />
          </div>
        </form>
        <DialogFooter className="sm:justify-between">
          <div>
            {formData.id && canEdit && (
              <Button type="button" variant="destructive" onClick={handleDelete}>Excluir</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            {canEdit && <Button type="submit" onClick={handleSubmit}>Salvar</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialCalendarModal;