import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Loader2, Save, Trash2, BellRing } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

const ReviewReminders = () => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReminder, setCurrentReminder] = useState({});

  const fetchReminders = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('review_reminders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReminders(data);
    } catch (error) {
      toast({ title: "Erro ao buscar lembretes", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const resetForm = () => {
    setCurrentReminder({
      reminder_title: 'Reunião de Revisão Científica Mensal',
      reminder_date: new Date().toISOString().split('T')[0],
      cron_pattern: '0 9 1 * 1', // 9am on first Monday of month
      is_active: true
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('review_reminders').insert(currentReminder);
      if (error) throw error;
      toast({ title: "Lembrete salvo!", variant: "success" });
      fetchReminders();
      setIsModalOpen(false);
    } catch(error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este lembrete?")) return;
    try {
      await supabase.from('review_reminders').delete().eq('id', id);
      toast({ title: 'Lembrete excluído', variant: 'success' });
      fetchReminders();
    } catch (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    }
  };
  
  const toggleActive = async (reminder) => {
    try {
      const { error } = await supabase
        .from('review_reminders')
        .update({ is_active: !reminder.is_active })
        .eq('id', reminder.id);
      if (error) throw error;
      toast({ title: `Lembrete ${!reminder.is_active ? 'ativado' : 'desativado'}.`, variant: 'success' });
      fetchReminders();
    } catch (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lembretes de Revisão</CardTitle>
            <CardDescription>Gerencie lembretes automáticos para as reuniões científicas.</CardDescription>
          </div>
          <Button onClick={handleOpenModal}><PlusCircle className="mr-2 h-4 w-4" /> Novo Lembrete</Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : reminders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <BellRing className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4">Nenhum lembrete configurado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map(reminder => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-semibold">{reminder.reminder_title}</p>
                    <p className="text-sm text-muted-foreground">Próximo: {format(new Date(reminder.reminder_date), 'dd/MM/yyyy')} | Padrão: {reminder.cron_pattern || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch checked={reminder.is_active} onCheckedChange={() => toggleActive(reminder)} />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Lembrete Automático</DialogTitle></DialogHeader>
          <div className="space-y-4 p-2">
            <div><Label htmlFor="reminder_title">Título</Label><Input id="reminder_title" value={currentReminder.reminder_title || ''} onChange={e => setCurrentReminder({...currentReminder, reminder_title: e.target.value})} /></div>
            <div><Label htmlFor="reminder_date">Data do Próximo Lembrete</Label><Input id="reminder_date" type="date" value={currentReminder.reminder_date || ''} onChange={e => setCurrentReminder({...currentReminder, reminder_date: e.target.value})} /></div>
            <div><Label htmlFor="cron_pattern">Padrão Cron (para recorrência)</Label><Input id="cron_pattern" placeholder="Ex: 0 9 * * 1 (9h toda segunda)" value={currentReminder.cron_pattern || ''} onChange={e => setCurrentReminder({...currentReminder, cron_pattern: e.target.value})} /></div>
            <div className="flex items-center space-x-2"><Switch id="is_active" checked={currentReminder.is_active} onCheckedChange={checked => setCurrentReminder({...currentReminder, is_active: checked})} /><Label htmlFor="is_active">Ativo</Label></div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Lembrete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReviewReminders;