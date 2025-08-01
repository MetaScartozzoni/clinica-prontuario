import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { FileText, History, Upload, ArrowRight, Stethoscope } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';

    const MedicalRecordActions = ({ patientId, onAction, formData }) => {
      const navigate = useNavigate();

      const handleEvolveToEvaluation = () => {
        navigate(`/avaliacao-medica/${patientId}`, { state: { initialData: formData } });
      };

      return (
        <Card className="card-glass sticky top-24">
          <CardHeader>
            <CardTitle>Ações do Atendimento</CardTitle>
            <CardDescription>Realize ações rápidas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => onAction('prescription')} variant="outline" className="w-full justify-start">
              <Stethoscope className="mr-2 h-4 w-4 text-violet-300" /> Gerar Receita
            </Button>
            <Button onClick={() => onAction('certificate')} variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4 text-violet-300" /> Gerar Atestado
            </Button>
            <Button onClick={() => onAction('exam_request')} variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4 text-violet-300" /> Solicitar Exame
            </Button>
            <Button onClick={() => navigate(`/exames/${patientId}`)} variant="outline" className="w-full justify-start">
              <History className="mr-2 h-4 w-4 text-violet-300" /> Ver Histórico de Exames
            </Button>
            <Button onClick={() => onAction('upload')} variant="outline" className="w-full justify-start">
              <Upload className="mr-2 h-4 w-4 text-violet-300" /> Upload de Arquivo
            </Button>
            <div className="pt-3 border-t border-white/10">
              <Button onClick={handleEvolveToEvaluation} className="w-full btn-gradient">
                Evoluir para Avaliação Completa <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default MedicalRecordActions;