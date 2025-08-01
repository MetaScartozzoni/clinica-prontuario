import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ConsultationHeader = ({ patientName, onExit }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="page-title">Ficha de Atendimento</h1>
        <p className="page-subtitle">Paciente: {patientName}</p>
      </div>
      <Button variant="outline" onClick={onExit}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Dossiê
      </Button>
    </div>
  );
};

export default ConsultationHeader;