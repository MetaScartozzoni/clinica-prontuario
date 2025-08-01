import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { Loader2, UploadCloud, FileText, Trash2, DollarSign, ClipboardList, CalendarDays, Banknote, Wallet, Info, CheckCircle, PlusCircle } from 'lucide-react';

const AddEditProviderPaymentModal = ({ isOpen, onClose, payment, onSave }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    provider_name: '',
    provider_document: '',
    service_description: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    payment_method: 'PIX',
    status: 'Pendente',
    notes: '',
    proof_url: '',
    proof_file_name: '',
    proof_file_type: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (payment) {
      setFormData({
        provider_name: payment.provider_name || '',
        provider_document: payment.provider_document || '',
        service_description: payment.service_description || '',
        payment_date: payment.payment_date ? format(parseISO(payment.payment_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        amount: payment.amount || '',
        payment_method: payment.payment_method || 'PIX',
        status: payment.status || 'Pendente',
        notes: payment.notes || '',
        proof_url: payment.proof_url || '',
        proof_file_name: payment.proof_file_name || '',
        proof_file_type: payment.proof_file_type || '',
      });
      setSelectedFile(null); 
    } else {
      setFormData({
        provider_name: '',
        provider_document: '',
        service_description: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        payment_method: 'PIX',
        status: 'Pendente',
        notes: '',
        proof_url: '',
        proof_file_name: '',
        proof_file_type: '',
      });
      setSelectedFile(null);
    }
  }, [payment, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, proof_file_name: file.name, proof_file_type: file.type }));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
    }
    setFormData(prev => ({ ...prev, proof_file_name: payment?.proof_file_name || '', proof_file_type: payment?.proof_file_type || '', proof_url: payment?.proof_url || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSave = {
      ...formData,
      amount: parseFloat(formData.amount),
      user_id: user?.id,
    };
    delete dataToSave.proof_file_name; 
    delete dataToSave.proof_file_type;

    try {
      let uploadedProofUrl = formData.proof_url;
      let uploadedProofFileName = formData.proof_file_name;
      let uploadedProofFileType = formData.proof_file_type;

      if (selectedFile) {
        const fileName = `provider_payments/${user?.id}/${Date.now()}-${selectedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('financial-proofs')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('financial-proofs').getPublicUrl(uploadData.path);
        uploadedProofUrl = urlData.publicUrl;
        uploadedProofFileName = selectedFile.name;
        uploadedProofFileType = selectedFile.type;
      }
      
      dataToSave.proof_url = uploadedProofUrl;
      dataToSave.proof_file_name = uploadedProofFileName;
      dataToSave.proof_file_type = uploadedProofFileType;

      let error;
      if (payment && payment.id) {
        const { error: updateError } = await supabase
          .from('financial_service_provider_payments')
          .update(dataToSave)
          .eq('id', payment.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('financial_service_provider_payments')
          .insert(dataToSave);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: `Pagamento ${payment ? 'Atualizado' : 'Registrado'}!`,
        description: `O pagamento para ${formData.provider_name} foi salvo com sucesso.`,
        variant: 'success',
      });
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar pagamento:", error);
      toast({
        title: "Erro ao Salvar Pagamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = ["PIX", "Transferência Bancária", "Boleto", "Cartão de Crédito", "Dinheiro", "Outro"];
  const paymentStatuses = ["Pendente", "Pago", "Atrasado", "Cancelado"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl modal-light-theme">
        <DialogHeader>
          <DialogTitle className="flex items-center dialog-title-custom">
            <DollarSign className="mr-2 h-6 w-6 text-primary" />
            {payment ? 'Editar Pagamento a Prestador' : 'Registrar Novo Pagamento a Prestador'}
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Preencha os detalhes do pagamento abaixo. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="provider_name" className="label-custom">Nome do Prestador *</Label>
            <Input id="provider_name" name="provider_name" value={formData.provider_name} onChange={handleChange} required className="input-light-theme" placeholder="Nome completo do prestador" />
          </div>
          <div>
            <Label htmlFor="provider_document" className="label-custom">Documento (CPF/CNPJ)</Label>
            <Input id="provider_document" name="provider_document" value={formData.provider_document} onChange={handleChange} className="input-light-theme" placeholder="CPF ou CNPJ" />
          </div>
          <div>
            <Label htmlFor="service_description" className="label-custom">Descrição do Serviço *</Label>
            <Textarea id="service_description" name="service_description" value={formData.service_description} onChange={handleChange} required className="input-light-theme" placeholder="Ex: Consultoria SEO para website"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_date" className="label-custom">Data do Pagamento *</Label>
              <Input id="payment_date" name="payment_date" type="date" value={formData.payment_date} onChange={handleChange} required className="input-light-theme"/>
            </div>
            <div>
              <Label htmlFor="amount" className="label-custom">Valor (R$) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required className="input-light-theme" placeholder="Ex: 1250.50"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <Label htmlFor="payment_method" className="label-custom">Método de Pagamento</Label>
              <Select name="payment_method" value={formData.payment_method} onValueChange={(value) => handleSelectChange('payment_method', value)}>
                <SelectTrigger className="input-light-theme"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status" className="label-custom">Status</Label>
              <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="input-light-theme"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
           <div>
            <Label htmlFor="proof" className="label-custom">Comprovante de Pagamento</Label>
            <div className="mt-1 flex items-center space-x-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-grow justify-start input-light-theme hover:bg-accent/50">
                <UploadCloud className="mr-2 h-4 w-4" />
                {selectedFile ? selectedFile.name : (formData.proof_file_name || 'Selecionar arquivo')}
              </Button>
              {(selectedFile || formData.proof_url) && (
                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input 
              id="proof" 
              name="proof" 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx"
            />
            {formData.proof_url && !selectedFile && (
              <div className="mt-2 text-sm text-muted-foreground">
                <a href={formData.proof_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                  <FileText className="mr-1 h-4 w-4" /> {formData.proof_file_name || 'Ver comprovante atual'}
                </a>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="notes" className="label-custom">Observações</Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} className="input-light-theme" placeholder="Detalhes adicionais sobre o pagamento"/>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="btn-frutacor">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (payment ? <CheckCircle className="mr-2 h-4 w-4"/> : <PlusCircle className="mr-2 h-4 w-4"/>)}
              {payment ? 'Salvar Alterações' : 'Registrar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditProviderPaymentModal;