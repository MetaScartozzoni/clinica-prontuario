import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const UpcomingAppointmentsCard = ({ upcomingAppointments, isLoading }) => {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Consultas</CardTitle>
        <CardDescription>Pacientes agendados para os próximos dias.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
          <ul className="space-y-3">
            {upcomingAppointments.map((appt, idx) => (
              <li key={idx} className="flex justify-between items-center p-3 bg-muted/20 rounded-md">
                <span className="text-card-foreground/90">{appt.patient_name} - {new Date(appt.scheduled_date_time).toLocaleDateString()}</span> 
                <Button size="sm" variant="outline" onClick={() => navigate('/agenda')}>Detalhes</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhuma consulta futura encontrada.</p>
        )}
        <Button onClick={() => navigate('/agenda')} className="mt-4 w-full btn-frutacor">Ver Agenda Completa</Button>
      </CardContent>
    </Card>
  );
};
UpcomingAppointmentsCard.defaultProps = {
  isLoading: false,
};

export default UpcomingAppointmentsCard;