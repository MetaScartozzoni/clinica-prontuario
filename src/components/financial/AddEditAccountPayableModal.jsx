import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, DollarSign, CalendarDays, Tag, Building, Info, CheckCircle, PlusCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AddEditAccountPayableModal = ({ isOpen, onClose, onSave, accountData, categories, statuses }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    due_date: '',
    description: '',
    amount: '',
    category: '',
    supplier_name: '',
    status: 'Pendente',
    payment_date: '',
    payment_method: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    setCurrentUserId(userId);

    if (accountData) {
      setFormData({
        due_date: accountData.due_date ? format(parseISO(accountData.due_date), 'yyyy-MM-dd') : '',
        description: accountData.description || '',
        amount: accountData.amount || '',
        category: accountData.category || '',
        supplier_name: accountData.supplier_name || '',
        status: accountData.status || 'Pendente',
        payment_date: accountData.payment_date ? format(parseISO(accountData.payment_date), 'yyyy-MM-dd') : '',
        payment_method: accountData.payment_method || '',
        notes: accountData.notes || '',
      });
    } else {
      setFormData({
        due_date: '',
        description: '',
        amount: '',
        category: '',
        supplier_name: '',
        status: 'Pendente',
        payment_date: '',
        payment_method: '',
        notes: '',
      });
    }
  }, [accountData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.due_date || !formData.description || !formData.amount) {
      toast({ title: "Campos Obrigatórios", description: "Data de Vencimento, Descrição e Valor são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const dataToSave = {
      ...formData,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date || null,
      payment_date: formData.payment_date || null,
      user_id: currentUserId,
      updated_at: new Date().toISOString(),
    };

    try {
      let response;
      if (accountData?.id) { 
        response = await supabase
          .from('financial_accounts_payable')
          .update(dataToSave)
          .eq('id', accountData.id)
          .select()
          .single();
      } else { 
        dataToSave.created_at = new Date().toISOString();
        response = await supabase
          .from('financial_accounts_payable')
          .insert(dataToSave)
          .select()
          .single();
      }

      const { error } = response;
      if (error) throw error;

      toast({ title: `Conta ${accountData?.id ? 'Atualizada' : 'Adicionada'}!`, description: "A operação foi realizada com sucesso.", variant: "success" });
      onSave();
    } catch (err) {
      console.error(`Erro ao ${accountData?.id ? 'atualizar' : 'adicionar'} conta:`, err);
      toast({ title: `Erro ao Salvar`, description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl modal-light-theme">
        <DialogHeader>
          <DialogTitle className="flex items-center dialog-title-custom">
            <DollarSign className="mr-2 h-6 w-6 text-primary" />
            {accountData?.id ? 'Editar Conta a Pagar' : 'Adicionar Nova Conta a Pagar'}
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Preencha os detalhes da conta. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due_date" className="label-custom">Data de Vencimento *</Label>
              <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="amount" className="label-custom">Valor (R$) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="Ex: 150.75" value={formData.amount} onChange={handleInputChange} required />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="label-custom">Descrição *</Label>
            <Input id="description" name="description" placeholder="Ex: Pagamento de software de gestão" value={formData.description} onChange={handleInputChange} required />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="label-custom">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger id="category" className="select-trigger-custom">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="select-content-custom">
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="select-item-custom">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supplier_name" className="label-custom">Nome do Fornecedor/Beneficiário</Label>
              <Input id="supplier_name" name="supplier_name" placeholder="Ex: Empresa XYZ Ltda." value={formData.supplier_name} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="label-custom">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger id="status" className="select-trigger-custom">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="select-content-custom">
                  {statuses.map(stat => (
                    <SelectItem key={stat} value={stat} className="select-item-custom">{stat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.status === 'Pago' && (
              <div>
                <Label htmlFor="payment_date" className="label-custom">Data de Pagamento</Label>
                <Input id="payment_date" name="payment_date" type="date" value={formData.payment_date} onChange={handleInputChange} />
              </div>
            )}
          </div>

          {formData.status === 'Pago' && (
            <div>
              <Label htmlFor="payment_method" className="label-custom">Método de Pagamento</Label>
              <Input id="payment_method" name="payment_method" placeholder="Ex: PIX, Boleto, Cartão de Crédito" value={formData.payment_method} onChange={handleInputChange} />
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="label-custom">Observações</Label>
            <Textarea id="notes" name="notes" placeholder="Alguma nota adicional sobre esta conta..." value={formData.notes} onChange={handleInputChange} rows={3} />
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="btn-frutacor">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (accountData?.id ? <CheckCircle className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
              {accountData?.id ? 'Salvar Alterações' : 'Adicionar Conta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditAccountPayableModal;