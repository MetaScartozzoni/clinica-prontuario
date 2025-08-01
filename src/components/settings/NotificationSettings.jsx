import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; 
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const NotificationSettings = () => {
  const { toast } = useToast();

  const handleSaveNotificationSettings = () => {
    toast({ title: "Preferências Salvas", description: "Suas preferências de notificação foram salvas (simulado)." });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Preferências de Notificação</CardTitle>
        <CardDescription>Escolha como você deseja ser notificado.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Notificações por Email:</h4>
          <div className="flex items-center space-x-2">
            <Checkbox id="email-new-lead" defaultChecked />
            <Label htmlFor="email-new-lead" className="font-normal text-sm">Novos leads recebidos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="email-appointment-confirmation" />
            <Label htmlFor="email-appointment-confirmation" className="font-normal text-sm">Confirmações de agendamento</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="email-budget-accepted" defaultChecked />
            <Label htmlFor="email-budget-accepted" className="font-normal text-sm">Orçamentos aceitos</Label>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Notificações no Aplicativo:</h4>
          <div className="flex items-center space-x-2">
            <Checkbox id="app-task-reminder" defaultChecked />
            <Label htmlFor="app-task-reminder" className="font-normal text-sm">Lembretes de tarefas importantes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="app-unread-message" defaultChecked />
            <Label htmlFor="app-unread-message" className="font-normal text-sm">Novas mensagens internas não lidas</Label>
          </div>
        </div>
        <Button onClick={handleSaveNotificationSettings} className="bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white">Salvar Preferências</Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;