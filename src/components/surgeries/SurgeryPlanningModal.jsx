import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, PlusCircle, Trash2, ClipboardList } from 'lucide-react';

const ChecklistSection = ({ title, items, setItems, category }) => {
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleCheckedChange = (index, checked) => {
    const newItems = [...items];
    newItems[index].is_completed = checked;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: `new-${Date.now()}`, description: '', category: category, is_completed: false, due_date: null }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-violet-200">{title}</h4>
      {items.filter(i => i.category === category).map((item, index) => (
        <div key={item.id || `temp-${index}`} className="flex items-center gap-2 p-2 bg-black/10 rounded-md">
          <Checkbox
            id={`item-${category}-${item.id || `temp-${index}`}`}
            checked={item.is_completed}
            onCheckedChange={(checked) => handleCheckedChange(items.findIndex(i => i.id === item.id), checked)}
          />
          <Input
            className="flex-grow"
            value={item.description}
            onChange={(e) => handleItemChange(items.findIndex(i => i.id === item.id), 'description', e.target.value)}
            placeholder="Descrição da tarefa..."
          />
          <Input
            type="date"
            className="w-40"
            value={item.due_date || ''}
            onChange={(e) => handleItemChange(items.findIndex(i => i.id === item.id), 'due_date', e.target.value)}
          />
          <Button variant="destructive" size="icon" onClick={() => removeItem(items.findIndex(i => i.id === item.id))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem}>
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tarefa
      </Button>
    </div>
  );
};


const SurgeryPlanningModal = ({ isOpen, onClose, surgery, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({});
  const [checklistItems, setChecklistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChecklistItems = useCallback(async (surgeryId) => {
    if (!surgeryId) return;
    const { data, error } = await supabase
      .from('surgery_checklist_items')
      .select('*')
      .eq('surgery_schedule_id', surgeryId);
    
    if (error) {
      toast({ title: 'Erro ao buscar checklist', description: error.message, variant: 'destructive' });
      setChecklistItems([]);
    } else {
      setChecklistItems(data || []);
    }
  }, [toast]);
  
  useEffect(() => {
    if (surgery) {
      setFormData({
        anesthesiologist: surgery.anesthesiologist || '',
        instrumentalist: surgery.instrumentalist || '',
        required_equipment: surgery.required_equipment || '',
        notes: surgery.notes || '',
      });
      fetchChecklistItems(surgery.id);
    }
  }, [surgery, fetchChecklistItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
        const { error: updateError } = await supabase
            .from('surgery_schedule')
            .update({
              anesthesiologist: formData.anesthesiologist,
              instrumentalist: formData.instrumentalist,
              required_equipment: formData.required_equipment,
              notes: formData.notes,
            })
            .eq('id', surgery.id);
        if (updateError) throw updateError;
        
        // Separa itens existentes de novos itens (que não possuem 'id' ou têm id temporário)
        const itemsToUpdate = checklistItems.filter(item => item.id && !item.id.toString().startsWith('new-'));
        const itemsToInsert = checklistItems.filter(item => !item.id || item.id.toString().startsWith('new-'));

        // Obtém os IDs dos itens que DEVEM permanecer
        const currentChecklistIds = itemsToUpdate.map(item => item.id);

        // Primeiro, deleta os itens que foram removidos do checklist na UI
        const { error: deleteError } = await supabase
            .from('surgery_checklist_items')
            .delete()
            .eq('surgery_schedule_id', surgery.id)
            .not('id', 'in', `(${currentChecklistIds.length > 0 ? currentChecklistIds.map(id => `'${id}'`).join(',') : 'NULL'})`); // Lida com array vazio

        if (deleteError) throw deleteError;

        // Atualiza itens existentes
        if (itemsToUpdate.length > 0) {
            const { error: updateItemsError } = await supabase
                .from('surgery_checklist_items')
                .upsert(itemsToUpdate, { onConflict: 'id', ignoreDuplicates: false });
            if (updateItemsError) throw updateItemsError;
        }

        // Insere novos itens
        if (itemsToInsert.length > 0) {
            const { error: insertItemsError } = await supabase
                .from('surgery_checklist_items')
                .insert(itemsToInsert.map(item => ({
                  surgery_schedule_id: surgery.id,
                  description: item.description,
                  category: item.category,
                  is_completed: item.is_completed,
                  due_date: item.due_date,
                })));
            if (insertItemsError) throw insertItemsError;
        }


        toast({ title: 'Sucesso!', description: 'Plano cirúrgico salvo com sucesso.', variant: 'success' });
        if(onSave) onSave();
        onClose();
    } catch(error) {
        toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ClipboardList className="mr-2 h-6 w-6 text-pink-400" />
            Planejamento Cirúrgico
          </DialogTitle>
          <DialogDescription>
            Detalhes para a cirurgia de {surgery?.patient_name} em {new Date(surgery?.scheduled_date_time).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="anesthesiologist">Anestesista</Label>
              <Input id="anesthesiologist" name="anesthesiologist" value={formData.anesthesiologist} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="instrumentalist">Instrumentador(a)</Label>
              <Input id="instrumentalist" name="instrumentalist" value={formData.instrumentalist} onChange={handleInputChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="required_equipment">Equipamentos Especiais</Label>
            <Textarea id="required_equipment" name="required_equipment" value={formData.required_equipment} onChange={handleInputChange} placeholder="Liste os equipamentos necessários, um por linha." />
          </div>
           <div>
            <Label htmlFor="notes">Notas da Cirurgia</Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Observações importantes sobre o planejamento e execução." />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <ChecklistSection title="Checklist Pré-Operatório" items={checklistItems} setItems={setChecklistItems} category="Pre-Op" />
          </div>
          <div className="space-y-4 pt-4 border-t border-white/10">
            <ChecklistSection title="Checklist Pós-Operatório" items={checklistItems} setItems={setChecklistItems} category="Post-Op" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Plano
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SurgeryPlanningModal;