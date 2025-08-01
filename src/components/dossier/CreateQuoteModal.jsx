import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Loader2, PlusCircle, Trash2, Save } from 'lucide-react';
    import { useProfile } from '@/contexts/ProfileContext';

    const CreateQuoteModal = ({ isOpen, onClose, patientId, patientName, onSuccess, quoteData }) => {
      const { toast } = useToast();
      const { profile } = useProfile();
      const [customSurgeryName, setCustomSurgeryName] = useState('');
      const [surgeryTypeId, setSurgeryTypeId] = useState('');
      const [status, setStatus] = useState('Pendente');
      const [items, setItems] = useState([{ description: '', quantity: 1, unit_price: '' }]);
      const [totalValue, setTotalValue] = useState(0);
      const [isLoading, setIsLoading] = useState(false);
      const [surgeryTypes, setSurgeryTypes] = useState([]);
      const [observation, setObservation] = useState('');

      const fetchSurgeryTypes = useCallback(async () => {
        const { data, error } = await supabase.from('surgery_types').select('id, name, default_items').order('name');
        if (error) {
          toast({ title: "Erro ao carregar tipos de cirurgia", description: error.message, variant: "destructive" });
        } else {
          setSurgeryTypes(data);
        }
      }, [toast]);
      
      useEffect(() => {
        if (isOpen) {
          fetchSurgeryTypes();
        }
      }, [isOpen, fetchSurgeryTypes]);

      useEffect(() => {
        if (quoteData) {
          setCustomSurgeryName(quoteData.custom_surgery_name || '');
          setStatus(quoteData.status || 'Pendente');
          setSurgeryTypeId(quoteData.surgery_type_id || '');
          setObservation(quoteData.observation || '');
          
          const fetchItems = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('quote_items').select('*').eq('quote_id', quoteData.id);
            if (error) {
                toast({ title: "Erro ao carregar itens", description: error.message, variant: 'destructive'});
                setItems([{ description: '', quantity: 1, unit_price: '' }]);
            } else {
                setItems(data.length > 0 ? data.map(i => ({...i, unit_price: i.unit_price || ''})) : [{ description: '', quantity: 1, unit_price: '' }]);
            }
            setIsLoading(false);
          };
          fetchItems();
        } else {
          setCustomSurgeryName('');
          setStatus('Pendente');
          setSurgeryTypeId('');
          setItems([{ description: 'Honorários', quantity: 1, unit_price: '' }]);
          setObservation('');
        }
      }, [quoteData, isOpen, toast]);
      
      const handleSurgeryTypeChange = (typeId) => {
        const selectedType = surgeryTypes.find(st => st.id.toString() === typeId);
        setSurgeryTypeId(typeId);
        if(selectedType) {
            setCustomSurgeryName(selectedType.name);
            if(selectedType.default_items && Array.isArray(selectedType.default_items)) {
                const newItems = selectedType.default_items.map(item => ({
                    description: item.name || '',
                    quantity: 1,
                    unit_price: item.price || ''
                }));
                setItems(newItems.length > 0 ? newItems : [{ description: 'Honorários', quantity: 1, unit_price: '' }]);
            } else {
                setItems([{ description: 'Honorários', quantity: 1, unit_price: '' }]);
            }
        }
      };

      const calculateTotal = useCallback(() => {
        const total = items.reduce((acc, item) => {
          const price = parseFloat(item.unit_price) || 0;
          const quantity = parseInt(item.quantity, 10) || 0;
          return acc + (price * quantity);
        }, 0);
        setTotalValue(total);
      }, [items]);

      useEffect(() => {
        calculateTotal();
      }, [items, calculateTotal]);

      const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
      };

      const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unit_price: '' }]);
      };

      const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
      };

      const handleSubmit = async () => {
        if (!customSurgeryName.trim()) {
          toast({ title: 'Campo obrigatório', description: 'O nome do procedimento é obrigatório.', variant: 'destructive' });
          return;
        }
        if (!profile) {
            toast({ title: 'Erro de autenticação', description: 'Usuário não identificado.', variant: 'destructive'});
            return;
        }
        setIsLoading(true);
        
        const quotePayload = {
          patient_id: patientId,
          custom_surgery_name: customSurgeryName,
          surgery_type_id: surgeryTypeId || null,
          status: status,
          total_value: totalValue,
          created_by: profile.id,
          observation: observation
        };

        try {
          let savedQuote;
          if (quoteData?.id) {
            const { data, error } = await supabase.from('quotes').update(quotePayload).eq('id', quoteData.id).select().single();
            if (error) throw error;
            savedQuote = data;
            await supabase.from('quote_items').delete().eq('quote_id', savedQuote.id);
          } else {
            const { data, error } = await supabase.from('quotes').insert(quotePayload).select().single();
            if (error) throw error;
            savedQuote = data;
          }
          
          const itemsPayload = items
            .filter(item => item.description && item.unit_price)
            .map(item => ({
              quote_id: savedQuote.id,
              description: item.description,
              quantity: parseInt(item.quantity, 10),
              unit_price: parseFloat(item.unit_price)
            }));

          if(itemsPayload.length > 0) {
            const { error: itemsError } = await supabase.from('quote_items').insert(itemsPayload);
            if (itemsError) throw itemsError;
          }

          toast({ title: 'Sucesso!', description: `Orçamento ${quoteData ? 'atualizado' : 'criado'} com sucesso.`, variant: 'success' });
          onSuccess();
          onClose();

        } catch (error) {
          toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-3xl modal-dark-theme">
            <DialogHeader>
              <DialogTitle className="dialog-title-custom">{quoteData ? 'Editar' : 'Criar'} Orçamento para {patientName}</DialogTitle>
              <DialogDescription className="dialog-description-custom">
                Detalhe os itens e valores para o procedimento.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="surgeryTypeId" className="label-custom">Tipo de Cirurgia (Base)</Label>
                  <Select value={surgeryTypeId} onValueChange={handleSurgeryTypeChange}>
                      <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione para preencher" /></SelectTrigger>
                      <SelectContent className="select-content-custom">
                          {surgeryTypes.map(st => (
                              <SelectItem key={st.id} value={st.id.toString()} className="select-item-custom">{st.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="customSurgeryName" className="label-custom">Nome da Cirurgia (Personalizado)</Label>
                  <Input id="customSurgeryName" value={customSurgeryName} onChange={(e) => setCustomSurgeryName(e.target.value)} className="input-light-theme" />
                </div>
                <div>
                  <Label htmlFor="status" className="label-custom">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="select-trigger-custom"><SelectValue /></SelectTrigger>
                    <SelectContent className="select-content-custom">
                      <SelectItem value="Pendente" className="select-item-custom">Pendente</SelectItem>
                      <SelectItem value="Enviado" className="select-item-custom">Enviado</SelectItem>
                      <SelectItem value="Aceito" className="select-item-custom">Aceito</SelectItem>
                      <SelectItem value="Recusado" className="select-item-custom">Recusado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="observation" className="label-custom">Observações do Orçamento</Label>
                <Textarea id="observation" value={observation} onChange={(e) => setObservation(e.target.value)} className="textarea-light-theme" placeholder="Adicione notas sobre o orçamento..." />
              </div>
              
              <div className="space-y-2">
                <Label className="label-custom">Itens do Orçamento</Label>
                {items.map((item, index) => (
                  <div key={index} className="flex items-end gap-2 p-2 bg-black/10 rounded-md">
                    <div className="flex-grow">
                      <Label className="text-xs text-violet-300">Descrição</Label>
                      <Input value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Ex: Honorários do Cirurgião" className="input-light-theme" />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs text-violet-300">Qtd.</Label>
                      <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} min="1" className="input-light-theme" />
                    </div>
                    <div className="w-32">
                      <Label className="text-xs text-violet-300">Valor Unit.</Label>
                      <Input type="number" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} placeholder="R$" className="input-light-theme" />
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addItem}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>
              </div>

              <div className="text-right font-bold text-xl text-violet-200 pt-4">
                Total: {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="btn-frutacor">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Orçamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default CreateQuoteModal;