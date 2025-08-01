import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/dashboard/StatCard';
import SalesFunnelCard from '@/components/dashboard/SalesFunnelCard';
import RemindersCard from '@/components/dashboard/RemindersCard';
import FinancialSummaryCard from '@/components/dashboard/FinancialSummaryCard';
import UpcomingAppointmentsCard from '@/components/dashboard/UpcomingAppointmentsCard';
import { Users, UserCheck, UserPlus, FileText, BarChart, BellRing, DollarSign, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboardPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, pendingUsers: 0, totalPatients: 0 });
  const [funnelData, setFunnelData] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    funnel: true,
    reminders: true,
    financial: true,
    appointments: true
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true, funnel: true, reminders: true, financial: true, appointments: true }));

        const [
          statsRes,
          funnelRes,
          remindersRes,
          financialRes,
          appointmentsRes
        ] = await Promise.all([
          supabase.rpc('get_admin_dashboard_stats'),
          supabase.rpc('get_sales_funnel_data'),
          supabase.rpc('get_admin_reminders'),
          supabase.rpc('get_financial_summary'),
          supabase.rpc('get_upcoming_appointments', { days_ahead: 7 })
        ]);
        
        if (statsRes.error) throw new Error(`Stats Error: ${statsRes.error.message}`);
        setStats(statsRes.data[0]);
        setLoading(prev => ({ ...prev, stats: false }));

        if (funnelRes.error) throw new Error(`Funnel Error: ${funnelRes.error.message}`);
        const funnel = funnelRes.data[0];
        setFunnelData({
            labels: ['Leads', 'Qualificados', 'Orçamentos', 'Convertidos'],
            datasets: [{
                label: 'Contagem',
                data: [funnel.leads_count, funnel.qualified_count, funnel.quotes_count, funnel.converted_count],
                backgroundColor: ['#A855F7', '#8B5CF6', '#6D28D9', '#5B21B6'],
            }]
        });
        setLoading(prev => ({ ...prev, funnel: false }));
        
        if (remindersRes.error) throw new Error(`Reminders Error: ${remindersRes.error.message}`);
        setReminders(remindersRes.data.map(r => ({ ...r, icon: <BellRing className="mr-4 h-5 w-5 flex-shrink-0" /> })));
        setLoading(prev => ({ ...prev, reminders: false }));

        if (financialRes.error) throw new Error(`Financial Error: ${financialRes.error.message}`);
        setFinancialSummary(financialRes.data[0]);
        setLoading(prev => ({ ...prev, financial: false }));
        
        if (appointmentsRes.error) throw new Error(`Appointments Error: ${appointmentsRes.error.message}`);
        setUpcomingAppointments(appointmentsRes.data);
        setLoading(prev => ({ ...prev, appointments: false }));

      } catch (error) {
        console.error("Dashboard data fetching error:", error);
        toast({
          title: "Erro ao carregar o dashboard",
          description: error.message,
          variant: "destructive",
        });
        setLoading({ stats: false, funnel: false, reminders: false, financial: false, appointments: false });
      }
    };

    fetchAllData();
  }, [toast]);

  const statCards = [
    { title: "Total de Usuários", value: stats.totalUsers, icon: <Users className="h-5 w-5" />, color: "#3B82F6", actionLabel: "Gerenciar Usuários", onAction: () => navigate('/admin/users') },
    { title: "Usuários Ativos", value: stats.activeUsers, icon: <UserCheck className="h-5 w-5" />, color: "#10B981" },
    { title: "Aprovações Pendentes", value: stats.pendingUsers, icon: <UserPlus className="h-5 w-5" />, color: "#F97316", actionLabel: "Ver Aprovações", onAction: () => navigate('/admin/users?status=pending') },
    { title: "Total de Pacientes", value: stats.totalPatients, icon: <FileText className="h-5 w-5" />, color: "#8B5CF6", actionLabel: "Ver Pacientes", onAction: () => navigate('/pacientes') },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            {...card}
            isLoading={loading.stats}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesFunnelCard funnelData={funnelData} isLoading={loading.funnel}/>
        </div>
        <div className="lg:col-span-1">
          <RemindersCard reminders={reminders} isLoading={loading.reminders} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <FinancialSummaryCard financialSummary={financialSummary} isLoading={loading.financial} />
        </div>
        <div className="lg:col-span-2">
          <UpcomingAppointmentsCard upcomingAppointments={upcomingAppointments} isLoading={loading.appointments} />
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;
