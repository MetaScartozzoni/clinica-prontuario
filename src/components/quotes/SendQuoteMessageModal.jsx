import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';
import { Label } from '../ui/label';

const SendQuoteMessageModal = ({ isOpen, onClose, quote }) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [messageBody, setMessageBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      setTemplates(data);
    } catch (error) {
      toast({ title: "Erro ao buscar modelos", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template && quote) {
      setSelectedTemplate(template);
      let body = template.body;
      const placeholders = {
        '{{paciente_nome}}': quote.patient_name,
        '{{procedimento_nome}}': quote.custom_surgery_name || quote.surgery_type?.name,
        '{{valor_total}}': (quote.total_value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      };
      
      for (const [key, value] of Object.entries(placeholders)) {
        body = body.replace(new RegExp(key, 'g'), value);
      }
      setMessageBody(body);
    }
  };
  
  const handleSend = async () => {
    // This is a simulation. In a real scenario, this would call a backend service.
    toast({
      title: "Mensagem Enviada! (Simulação)",
      description: `Mensagem enviada para ${quote.patient_name} via BotConversa.`,
      variant: "success"
    });

    // Log the action
    await supabase.rpc('log_audit_trail', {
        p_action: 'quote_message_sent',
        p_details: { 
            budgetId: quote.id, 
            patientId: quote.patient_id, 
            template: selectedTemplate?.template_name || 'custom'
        }
    });

    onClose();
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Send className="mr-2 h-6 w-6 text-primary" /> Enviar Mensagem para o Paciente
          </DialogTitle>
          <DialogDescription>
            Selecione um modelo e envie uma mensagem para {quote?.patient_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            {isLoading ? (
                <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>
            ) : (
            <div>
                <Label htmlFor="template-select">Selecione um Modelo</Label>
                <Select onValueChange={handleTemplateChange}>
                    <SelectTrigger id="template-select">
                        <SelectValue placeholder="Escolha um script de vendas..."/>
                    </SelectTrigger>
                    <SelectContent>
                        {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>{template.description}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            )}
          <div>
            <Label htmlFor="message-preview">Pré-visualização da Mensagem</Label>
            <Textarea
              id="message-preview"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={8}
              placeholder="A mensagem aparecerá aqui após selecionar um modelo."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSend} disabled={!messageBody}>
            <Send className="mr-2 h-4 w-4" /> Enviar via BotConversa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendQuoteMessageModal;