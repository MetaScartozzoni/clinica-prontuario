import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, isLoading, onClick }) => (
  <Card onClick={onClick} className="cursor-pointer hover:bg-muted/20 transition-colors">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
      <p className="text-xs text-muted-foreground">Clique para ver detalhes</p>
    </CardContent>
  </Card>
);

const DashboardView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    confirmed: 0,
    pending: 0,
    canceled: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_appointment_stats');
        if (error) throw error;
        setStats({
          confirmed: data[0].confirmed_count,
          pending: data[0].pending_count,
          canceled: data[0].canceled_count,
          today: data[0].today_count,
        });
      } catch (error) {
        toast({ title: 'Erro ao buscar estatísticas', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  const handleCardClick = (status) => {
    toast({
      title: "🚧 Funcionalidade em Desenvolvimento",
      description: "A navegação para detalhes dos agendamentos está sendo aprimorada!",
      variant: "info",
    });
    // navigate('/dashboard/secretaria', { state: { defaultTab: 'calendar', statusFilter: status } });
  };

  const statsCards = [
    { title: 'Agendamentos Confirmados', value: stats.confirmed, icon: <CheckCircle className="h-6 w-6 text-green-500" />, status: 'confirmado' },
    { title: 'Aguardando Confirmação', value: stats.pending, icon: <Clock className="h-6 w-6 text-yellow-500" />, status: 'aguardando' },
    { title: 'Agendamentos Cancelados', value: stats.canceled, icon: <XCircle className="h-6 w-6 text-red-500" />, status: 'cancelado' },
    { title: 'Consultas Hoje', value: stats.today, icon: <Calendar className="h-6 w-6 text-blue-500" />, status: 'hoje' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          isLoading={loading}
          onClick={() => handleCardClick(stat.status)}
        />
      ))}
    </div>
  );
};

export default DashboardView;