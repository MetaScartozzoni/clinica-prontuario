import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const TaskList = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return <p className="text-center text-violet-300 py-10">Nenhuma tarefa encontrada.</p>;
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Urgente': return 'bg-red-500/80 border-red-400';
      case 'Alta': return 'bg-yellow-500/80 border-yellow-400 text-black';
      case 'Média': return 'bg-blue-500/80 border-blue-400';
      default: return 'bg-gray-500/80 border-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Concluída': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'Atrasada': return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default: return <Clock className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {tasks.map(task => (
        <AccordionItem key={task.id} value={`task-${task.id}`} className="bg-black/20 border border-white/10 rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                {getStatusIcon(task.status)}
                <span className="font-medium text-left">{task.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={getPriorityClass(task.priority)}>{task.priority}</Badge>
                {task.due_date && (
                  <span className="text-xs text-gray-400 hidden md:block">
                    Vence em: {format(new Date(task.due_date), 'dd/MM/yyyy')}
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 space-y-3">
            <p className="text-sm text-gray-300">{task.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Criado por: {task.created_by?.full_name || 'Sistema'}</span>
              <span>{formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: ptBR })}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default TaskList;