import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Inbox, Search, Filter, ListTodo, MessageSquare, Bell } from 'lucide-react';
import TaskList from '@/components/tasks/TaskList';
import MessageList from '@/components/tasks/MessageList';
import NotificationList from '@/components/tasks/NotificationList';

const TaskCenterPage = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('Pendente');

  const fetchData = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [tasksRes, messagesRes, notificationsRes] = await Promise.all([
        supabase.from('tasks').select(`*, assignments:task_assignments(profiles(full_name)), created_by:profiles(full_name)`).eq('task_assignments.assignee_id', profile.id),
        supabase.from('messages').select(`*, sender:sender_id(full_name), recipient:recipient_id(full_name)`).or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`),
        supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (messagesRes.error) throw messagesRes.error;
      if (notificationsRes.error) throw notificationsRes.error;

      setTasks(tasksRes.data || []);
      setMessages(messagesRes.data || []);
      setNotifications(notificationsRes.data || []);

    } catch (error) {
      toast({ title: "Erro ao buscar dados", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [profile, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTasks = tasks
    .filter(task => task.status === taskFilter || taskFilter === 'Todas')
    .filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8"
    >
      <Card className="card-glass">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center"><Inbox className="mr-3 h-8 w-8 text-violet-400" /> Caixa de Entrada e Tarefas</CardTitle>
              <CardDescription>Sua central de notificações, mensagens e tarefas pendentes.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks"><ListTodo className="mr-2 h-4 w-4" />Tarefas</TabsTrigger>
              <TabsTrigger value="messages"><MessageSquare className="mr-2 h-4 w-4" />Mensagens</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notificações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="mt-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 border border-white/20 rounded-lg bg-black/20">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300" />
                  <Input placeholder="Buscar tarefas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={taskFilter} onValueChange={setTaskFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                    <SelectItem value="Atrasada">Atrasada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {loading ? <Loader2 className="mx-auto my-10 h-10 w-10 animate-spin text-violet-400" /> : <TaskList tasks={filteredTasks} />}
            </TabsContent>

            <TabsContent value="messages" className="mt-6">
              {loading ? <Loader2 className="mx-auto my-10 h-10 w-10 animate-spin text-violet-400" /> : <MessageList messages={messages} />}
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              {loading ? <Loader2 className="mx-auto my-10 h-10 w-10 animate-spin text-violet-400" /> : <NotificationList notifications={notifications} />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TaskCenterPage;