import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { FileText, History, Upload, ArrowRight, Stethoscope } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import { useToast } from '@/components/ui/use-toast';
    import UploadDocumentModal from '@/components/dossier/UploadDocumentModal';
    import CreateQuoteModal from '@/components/dossier/CreateQuoteModal';

    const ConsultationActions = ({ patientId, user, formData }) => {
      const navigate = useNavigate();
      const { toast } = useToast();
      const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
      const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

      const handleCreateQuote = () => {
        setIsQuoteModalOpen(true);
      };

      const handleEvolveToEvaluation = () => {
        navigate(`/avaliacao-medica/${patientId}`, { state: { initialData: formData } });
      };

      const handleActionClick = (actionDescription, modalSetter) => {
        toast({
          title: `Ação: ${actionDescription}`,
          description: 'Funcionalidade em desenvolvimento. Você pode solicitar no próximo prompt!',
        });
        if (modalSetter) modalSetter(false);
      };

      return (
        <>
          <Card className="card-glass sticky top-24">
            <CardHeader>
              <CardTitle>Ações do Atendimento</CardTitle>
              <CardDescription>Realize ações rápidas a partir desta consulta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => handleActionClick("Gerar Receita")} variant="outline" className="w-full justify-start">
                <Stethoscope className="mr-2 h-4 w-4 text-violet-300" /> Gerar Receita
              </Button>
              <Button onClick={() => handleActionClick("Gerar Atestado")} variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4 text-violet-300" /> Gerar Atestado
              </Button>
              <Button onClick={handleCreateQuote} variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4 text-violet-300" /> Criar Orçamento
              </Button>
              <Button onClick={() => navigate(`/exames/${patientId}`)} variant="outline" className="w-full justify-start">
                <History className="mr-2 h-4 w-4 text-violet-300" /> Ver Histórico de Exames
              </Button>
              <Button onClick={() => setIsUploadModalOpen(true)} variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4 text-violet-300" /> Upload de Arquivo
              </Button>
              <div className="pt-3 border-t border-white/10">
                <Button onClick={handleEvolveToEvaluation} className="w-full btn-gradient">
                  Evoluir para Avaliação Completa <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {isUploadModalOpen && (
            <UploadDocumentModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              patientId={patientId}
              onUploadSuccess={() => {
                toast({ title: 'Upload Concluído!', variant: 'success' });
                setIsUploadModalOpen(false);
              }}
            />
          )}

          {isQuoteModalOpen && (
             <CreateQuoteModal
              isOpen={isQuoteModalOpen}
              onClose={() => setIsQuoteModalOpen(false)}
              patientId={patientId}
              onSuccess={() => {
                toast({ title: 'Orçamento Criado!', description: 'Você pode visualizá-lo no dossiê do paciente.', variant: 'success' });
                setIsQuoteModalOpen(false);
              }}
              quoteData={{ custom_surgery_name: formData.conclusion, observation: formData.observation }}
            />
          )}
        </>
      );
    };

    export default ConsultationActions;