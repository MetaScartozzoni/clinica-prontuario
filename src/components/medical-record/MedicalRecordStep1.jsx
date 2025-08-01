import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import JotformEmbedModal from './JotformEmbedModal';

const MedicalRecordStep1 = ({ formData, handleInputChange, patientDetails }) => {
  const [isJotformOpen, setIsJotformOpen] = useState(false);
  const CONSULTATION_FORM_URL = 'https://form.jotform.com/250533090053648';

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={() => setIsJotformOpen(true)}
          className="btn-frutacor"
        >
          <FileText className="mr-2 h-4 w-4" />
          Abrir Formulário de Consulta
        </Button>
      </div>

      <JotformEmbedModal
        isOpen={isJotformOpen}
        onClose={() => setIsJotformOpen(false)}
        formUrl={CONSULTATION_FORM_URL}
        patientData={{
          name: patientDetails?.name || formData.patientName,
          phone: patientDetails?.phone || formData.phone,
          email: patientDetails?.email || 'clinica@email.com'
        }}
      />
    </div>
  );
};

export default MedicalRecordStep1;