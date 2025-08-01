import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Calendar, FileText, MessageSquare, User, Loader2, Gem } from 'lucide-react';
    import { motion } from 'framer-motion';
    import useAuthRole from '@/hooks/useAuthRole';
    import { usePatientDossier } from '@/hooks/usePatientDossier';
    import PatientDocuments from '@/components/dossier/PatientDocuments';
    import PatientChatView from '@/components/patient-portal/PatientChatView';
    import { useProfile } from '@/contexts/ProfileContext';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';

    const PatientPortalPage = () => {
      const { profile } = useProfile();
      const navigate = useNavigate();
      
      const { patient, isLoading, error, refetchData } = usePatientDossier(profile?.id); 
      const patientId = patient?.id;
      const currentUserId = profile?.user_id;

      return (
        <>
          <Helmet>
            <title>Portal do Paciente</title>
            <meta name="description" content="Acesse seus agendamentos, documentos e comunique-se com a clínica." />
          </Helmet>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-6 space-y-6"
          >
            <header className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center text-white">
                  <User className="mr-3 h-8 w-8 text-violet-400" />
                  Portal do Paciente
                </h1>
                <p className="text-violet-200">
                  Bem-vindo(a) ao seu espaço seguro para gerenciar sua jornada conosco.
                </p>
              </div>
              <Button onClick={() => navigate('/espaco-paciente')}>
                <Gem className="mr-2 h-4 w-4"/> Ir para Espaço do Paciente
              </Button>
            </header>

            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="appointments"><Calendar className="mr-2 h-4 w-4" />Meus Agendamentos</TabsTrigger>
                <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4" />Meus Documentos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="mt-4">
                <Card className="card-glass">
                  <CardHeader>
                    <CardTitle>Próximos Agendamentos</CardTitle>
                    <CardDescription>Confira suas próximas consultas e procedimentos.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-violet-300">Funcionalidade de agendamentos em desenvolvimento.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                 {isLoading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div> :
                  patientId ? (
                    <PatientDocuments patientId={patientId} onUploadSuccess={refetchData} />
                  ) : (
                    <Card className="card-glass">
                      <CardHeader>
                        <CardTitle>Meus Documentos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-violet-300">Não foi possível carregar os documentos.</p>
                      </CardContent>
                    </Card>
                  )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      );
    };

    export default PatientPortalPage;