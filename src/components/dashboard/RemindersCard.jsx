import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing, Loader2 } from 'lucide-react';

const RemindersCard = ({ reminders, isLoading }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center"><BellRing className="mr-2 h-6 w-6 text-yellow-400" /> Lembretes e Tarefas</CardTitle>
        <CardDescription>Ações importantes e notificações. {isLoading ? "(Carregando...)" : ""}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
           <div className="flex justify-center items-center h-40">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reminders && reminders.length > 0 ? (
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {reminders.map((reminder) => (
              <li key={reminder.id} className={`flex items-start p-3 rounded-md 
                ${reminder.type === 'warning' ? 'bg-orange-700/20 border-l-4 border-orange-500' : 
                  reminder.type === 'success' ? 'bg-green-700/20 border-l-4 border-green-500' : 
                  'bg-blue-700/20 border-l-4 border-blue-500'}`}>
                {React.cloneElement(reminder.icon, { className: `${reminder.icon.props.className} text-card-foreground/80`})}
                <span className="text-sm text-card-foreground/90">{reminder.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhum lembrete ou tarefa importante no momento.</p>
        )}
        <Button className="mt-4 w-full btn-frutacor">Ver Todas as Tarefas</Button>
      </CardContent>
    </Card>
  );
};

RemindersCard.defaultProps = {
  isLoading: false,
};
export default RemindersCard;