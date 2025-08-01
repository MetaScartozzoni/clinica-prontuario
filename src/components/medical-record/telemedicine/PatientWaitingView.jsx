import React from 'react';
import { Eye, Loader2 } from 'lucide-react';

const PatientWaitingView = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-muted/50 text-center p-4 rounded-b-lg">
      <div className="relative mb-4">
        <Eye className="h-16 w-16 text-primary/30" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Aguarde, por favor</h3>
      <p className="text-muted-foreground">O médico está preparando as informações para compartilhar com você.</p>
    </div>
  );
};

export default PatientWaitingView;