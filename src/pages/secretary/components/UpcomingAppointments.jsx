import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Calendar, Video } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const UpcomingAppointments = ({ refreshTrigger }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select('id, start_time, service_type, is_telemedicine, patients(full_name)')
        .gte('start_time', today.toISOString())
        .lte('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching upcoming appointments:', error);
      } else {
        setAppointments(data);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [refreshTrigger]);

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-white">Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {appointments.length > 0 ? appointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${appt.is_telemedicine ? 'bg-blue-500/30' : 'bg-green-500/30'}`}>
                      {appt.is_telemedicine ? <Video className="h-5 w-5 text-blue-300" /> : <Calendar className="h-5 w-5 text-green-300" />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{appt.patients.full_name}</p>
                      <p className="text-sm text-muted-foreground">{appt.service_type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-violet-300">
                    {format(new Date(appt.start_time), 'HH:mm')}
                  </p>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-10">Nenhum agendamento para hoje ou amanhã.</p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointments;