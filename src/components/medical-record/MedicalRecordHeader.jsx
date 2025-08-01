import React from 'react';
    import { Button } from '@/components/ui/button';
    import { ArrowLeft, Save, Loader2 } from 'lucide-react';

    const MedicalRecordHeader = ({ patientName, onBack, onSave, isSaving }) => {
      return (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">Ficha de Atendimento Rápido</h1>
            <p className="page-subtitle">Paciente: {patientName}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
            <Button className="btn-gradient w-full md:w-auto" onClick={onSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Atendimento
            </Button>
          </div>
        </div>
      );
    };

    export default MedicalRecordHeader;