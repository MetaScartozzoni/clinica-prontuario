import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Edit, Info, Send, KeyRound, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const QuoteSettings = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [stripeKey, setStripeKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('message_templates').select('*').order('template_name');
      if (error) throw error;
      setTemplates(data);
    } catch (error) {
      toast({ title: "Erro ao buscar templates", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchStripeKey = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_parameters')
        .select('parameter_value')
        .eq('parameter_key', 'STRIPE_PUBLISHABLE_KEY')
        .single();
      if (data) {
        setStripeKey(data.parameter_value);
      }
      if (error && error.code !== 'PGRST116') throw error;
    } catch (error) {
       toast({ title: "Erro ao buscar chave Stripe", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
    fetchStripeKey();
  }, [fetchTemplates, fetchStripeKey]);

  const handleEditClick = (template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSaveTemplate = async (updatedTemplate) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({
          subject: updatedTemplate.subject,
          body: updatedTemplate.body,
        })
        .eq('id', updatedTemplate.id);
      
      if (error) throw error;
      
      toast({ title: "Template salvo!", description: `O template "${updatedTemplate.template_name}" foi atualizado.`, variant: "success" });
      setIsEditing(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast({ title: "Erro ao salvar template", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStripeKey = async () => {
    setIsSavingKey(true);
    try {
      const { error } = await supabase
        .from('system_parameters')
        .upsert({ 
          parameter_key: 'STRIPE_PUBLISHABLE_KEY', 
          parameter_value: stripeKey,
          description: 'Chave publicável do Stripe para integração de pagamentos.'
        }, { onConflict: 'parameter_key' });

      if (error) throw error;
      
      toast({ title: "Chave Stripe Salva!", description: "A integração com o Stripe está pronta para ser usada.", variant: "success" });
    } catch (error) {
      toast({ title: "Erro ao salvar chave Stripe", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingKey(false);
    }
  };

  if (isLoading && templates.length === 0) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><MessageSquare className="mr-2 h-6 w-6 text-primary"/> Modelos de Mensagens de Vendas</CardTitle>
          <CardDescription>Edite os scripts para automação de vendas e follow-up com pacientes.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(template => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{template.description}</CardTitle>
                <div className="text-sm text-muted-foreground">Nome do Template: <Badge variant="secondary">{template.template_name}</Badge></div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="font-semibold">Assunto:</p>
                <p className="p-2 bg-muted rounded-md text-sm">{template.subject}</p>
                <p className="font-semibold">Corpo:</p>
                <p className="p-2 bg-muted rounded-md text-sm whitespace-pre-line">{template.body}</p>
                <div className="text-xs text-muted-foreground">
                  Placeholders disponíveis: {template.placeholders?.join(', ') || 'Nenhum'}
                </div>
              </CardContent>
              <CardContent>
                <Button onClick={() => handleEditClick(template)} className="w-full">
                  <Edit className="mr-2 h-4 w-4" /> Editar Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><KeyRound className="mr-2 h-6 w-6 text-primary"/> Configuração de Pagamento (Stripe)</CardTitle>
          <CardDescription>
            Integre com o Stripe para permitir pagamentos online. 
            <a href="https://docs.stripe.com/payments/checkout/client" target="_blank" rel="noopener noreferrer" className="text-primary underline ml-1">Siga este guia</a>
             para obter sua chave e habilitar o "Client-only Checkout".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">
                            Após aceitar o orçamento, o sistema gerará um link de pagamento do Stripe para o paciente. Para que a confirmação seja automática, é necessário configurar um <strong className="font-semibold">Webhook</strong> no seu painel do Stripe para notificar seu sistema quando um pagamento for concluído.
                        </p>
                    </div>
                </div>
            </div>
          <div>
            <Label htmlFor="stripe_key">Chave Publicável do Stripe</Label>
            <Input 
              id="stripe_key"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="pk_live_..."
            />
          </div>
          <Button onClick={handleSaveStripeKey} disabled={isSavingKey}>
            {isSavingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Chave
          </Button>
        </CardContent>
      </Card>

      {isEditing && selectedTemplate && (
        <EditTemplateModal 
          isOpen={isEditing} 
          onClose={() => setIsEditing(false)}
          template={selectedTemplate}
          onSave={handleSaveTemplate}
        />
      )}
    </div>
  );
};

const EditTemplateModal = ({ isOpen, onClose, template, onSave }) => {
  const [editedTemplate, setEditedTemplate] = useState(template);

  useEffect(() => {
    setEditedTemplate(template);
  }, [template]);

  const handleSave = () => {
    onSave(editedTemplate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Template: {template.template_name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Label htmlFor="subject">Assunto</Label>
            <Input 
              id="subject"
              value={editedTemplate.subject}
              onChange={(e) => setEditedTemplate({...editedTemplate, subject: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="body">Corpo da Mensagem</Label>
            <Textarea
              id="body"
              value={editedTemplate.body}
              onChange={(e) => setEditedTemplate({...editedTemplate, body: e.target.value})}
              rows={10}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Placeholders disponíveis: {template.placeholders?.join(', ') || 'Nenhum'}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteSettings;