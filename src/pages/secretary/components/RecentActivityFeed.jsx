import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FilePlus, UserPlus, CalendarPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const IconMap = {
  contact_request_created: FilePlus,
  patient_created: UserPlus,
  appointment_created: CalendarPlus,
};

const RecentActivityFeed = ({ refreshTrigger }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('auth_logs')
        .select('id, created_at, event_type, details')
        .in('event_type', ['contact_request_created', 'patient_created', 'appointment_created'])
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setActivities(data);
      }
      setLoading(false);
    };

    fetchActivities();
  }, [refreshTrigger]);

  const renderActivityText = (activity) => {
    const details = activity.details?.new_data || {};
    switch (activity.event_type) {
      case 'contact_request_created':
        return `Nova solicitação de ${details.patient_name_manual || 'paciente'}.`;
      case 'patient_created':
        return `Novo paciente cadastrado: ${details.full_name || 'Nome não informado'}.`;
      case 'appointment_created':
        return `Novo agendamento para paciente ID ${details.patient_id}.`;
      default:
        return 'Nova atividade registrada.';
    }
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-white">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {activities.length > 0 ? activities.map((activity) => {
                const Icon = IconMap[activity.event_type] || FilePlus;
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="bg-violet-500/20 p-2 rounded-full">
                      <Icon className="h-5 w-5 text-violet-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{renderActivityText(activity)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-center text-muted-foreground py-10">Nenhuma atividade recente.</p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;