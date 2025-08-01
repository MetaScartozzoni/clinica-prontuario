import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { User, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient'; // Para atualização do checklist
import { useToast } from '@/components/ui/use-toast';

const SurgeryJourneyCard = ({ journey, onChecklistItemChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckChange = async (itemId, isCompleted) => {
    try {
      let updateData = {};
      if (itemId === 'surgery_completed') {
        // Se a cirurgia foi marcada como "Realizada", atualize o status na tabela surgery_schedule
        const { error: surgeryUpdateError } = await supabase
          .from('surgery_schedule')
          .update({ status: isCompleted ? 'Agendada' : 'Realizada' }) // Inverte o status
          .eq('id', journey.surgery_schedule_id);

        if (surgeryUpdateError) throw surgeryUpdateError;
      } else {
        // Para os outros itens do checklist, atualize a tabela patient_journey_progress
        updateData = { [itemId]: !isCompleted };
        const { error: journeyUpdateError } = await supabase
          .from('patient_journey_progress')
          .update(updateData)
          .eq('id', journey.journey_id);
        
        if (journeyUpdateError) throw journeyUpdateError;
      }
      
      toast({
        title: 'Progresso atualizado!',
        description: `Etapa "${checklistItemsData.find(item => item.id === itemId).label}" foi ${!isCompleted ? 'concluída' : 'reaberta'}.`,
        variant: 'success',
      });
      onChecklistItemChange(); // Notifica o pai para refetch
    } catch (error) {
      toast({
        title: 'Erro ao atualizar progresso',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const checklistItemsData = [
    { id: 'exams_received', label: 'Exames Recebidos' },
    { id: 'insurance_guide_released', label: 'Guia Liberada' },
    { id: 'hospital_booked', label: 'Hospital Agendado' },
    { id: 'pre_op_completed', label: 'Pré-op Completo' },
    { id: 'consent_signed', label: 'Consentimento Assinado' },
    { id: 'prescription_issued', label: 'Receita Emitida' },
    { id: 'medical_certificate_ready', label: 'Atestado Pronto' },
    { id: 'surgery_completed', label: 'Cirurgia Realizada', valuePath: 'surgery_status', expectedValue: 'Realizada'} // Nova etapa
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col bg-[rgba(var(--card-bg-rgb),var(--card-bg-alpha-dark)/0.8)] dark:bg-[rgba(var(--card-bg-rgb),var(--card-bg-alpha-dark)/0.9)] hover:shadow-primary/20 transition-shadow duration-300">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/10"
          onClick={() => journey.patient_id && navigate(`/dossie/${journey.patient_id}`)}
        >
          <CardTitle className="text-xl text-primary flex items-center">
            <User className="mr-2 h-5 w-5" />
            {journey.patient_name || 'Paciente Desconhecido'}
          </CardTitle>
          <CardDescription>ID Jornada: {journey.journey_id.substring(0,8)}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 pt-0">
          <div className="text-sm space-y-1">
            <p><strong>Cirurgia:</strong> {journey.surgery_scheduled_date ? new Date(journey.surgery_scheduled_date).toLocaleDateString() : '-'}</p>
            <p><strong>Tipo:</strong> {journey.surgery_type || '-'}</p>
            <p><strong>Status Cirurgia:</strong> {journey.surgery_status || '-'}</p>
            <p><strong>Progresso:</strong> {journey.progress_percentage ? `${journey.progress_percentage.toFixed(0)}%` : '0%'}</p>
            <p><strong>Etapa Atual:</strong> {journey.current_stage || '-'}</p>
          </div>
          <div className="border-t border-[hsl(var(--border))] pt-3 space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Checklist Cirúrgico:</h4>
            {checklistItemsData.map(item => {
              const isChecked = item.valuePath ? (journey[item.valuePath] === item.expectedValue) : !!journey[item.id];
              const isDisabled = item.valuePath && item.valuePath === 'surgery_status'; // desabilita se for status da cirurgia

              return (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${journey.journey_id}-${item.id}`}
                    checked={isChecked}
                    onCheckedChange={() => handleCheckChange(item.id, isChecked)}
                    disabled={isDisabled}
                  />
                  <Label htmlFor={`${journey.journey_id}-${item.id}`} className={`text-xs cursor-pointer ${isDisabled ? 'text-gray-500' : ''}`}>
                    {item.label} {isDisabled && '(Status Cirurgia)'}
                  </Label>
                </div>
              );
            })}
          </div>
          {journey.observations && (
              <div className="border-t border-[hsl(var(--border))] pt-3">
                  <p className="text-xs text-muted-foreground italic"><strong>Obs:</strong> {journey.observations}</p>
              </div>
          )}
        </CardContent>
         <div className="p-4 border-t border-[hsl(var(--border))]">
              <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => journey.patient_id && navigate(`/dossie/${journey.patient_id}`)}
              >
                  <Edit className="mr-2 h-4 w-4" /> Abrir Prontuário
              </Button>
          </div>
      </Card>
    </motion.div>
  );
};
export default SurgeryJourneyCard;