import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const EvolutionDashboard = () => {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: dashboardData, error: rpcError } = await supabase.rpc('get_evolution_dashboard_data');
        if (rpcError) throw rpcError;
        setData(dashboardData);
      } catch (err) {
        setError(err.message);
        toast({
          title: 'Erro ao carregar dados do dashboard',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Erro</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não foi possível carregar os dados do dashboard de evolução.</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const satisfactionChartData = {
    labels: data?.satisfaction_by_period?.map(d => d.follow_up_period) || [],
    datasets: [
      {
        label: 'Satisfação Média do Paciente (de 10)',
        data: data?.satisfaction_by_period?.map(d => d.avg_satisfaction) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Satisfação do Paciente</CardTitle>
          <CardDescription>Média de satisfação por período de acompanhamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Line data={satisfactionChartData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Eventos Adversos</CardTitle>
          <CardDescription>Total de eventos adversos registrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{data?.adverse_events_count || 0}</div>
          <p className="text-sm text-muted-foreground">eventos registrados no total</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvolutionDashboard;