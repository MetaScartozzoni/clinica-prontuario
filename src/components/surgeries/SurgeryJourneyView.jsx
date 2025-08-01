import React from 'react';
import SurgeryJourneyCard from '@/components/surgeries/SurgeryJourneyCard.jsx';
import { useSurgeries } from '@/hooks/useSurgeries'; // Importar useSurgeries para refetchAll

const SurgeryJourneyView = () => {
  const { journeys, isLoading, error, refetchAll } = useSurgeries();

  const handleChecklistItemChange = () => {
    refetchAll(); // Dispara o refetch de todas as jornadas
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-violet-300">Carregando jornadas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-400">Erro ao carregar jornadas: {error}</p>
      </div>
    );
  }

  if (!journeys || journeys.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">Nenhuma jornada de paciente encontrada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {journeys.map((journey) => (
        <SurgeryJourneyCard 
          key={journey.journey_id} 
          journey={journey} 
          onChecklistItemChange={handleChecklistItemChange} 
        />
      ))}
    </div>
  );
};

export default SurgeryJourneyView;