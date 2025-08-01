import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { useProfile } from '@/contexts/ProfileContext';
    import { Gem, Calendar, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
    import PatientScheduling from '@/components/patient-portal/PatientScheduling';
    import PatientCommunication from '@/components/patient-portal/PatientCommunication';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

    const PatientSchedulingPage = () => {
      const { profile, loadingProfile } = useProfile();

      if (loadingProfile) {
        return (
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2 className="h-16 w-16 animate-spin text-violet-400" />
          </div>
        );
      }

      if (!profile) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-white">
            <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
            <h2 className="text-2xl font-semibold text-red-400">Acesso Negado</h2>
            <p className="text-violet-300">Você precisa estar logado para acessar esta página.</p>
          </div>
        );
      }
      
      const patientId = profile?.id;

      return (
        <>
          <Helmet>
            <title>Espaço do Paciente</title>
            <meta name="description" content="Agende seu bate-papo e comunique-se com a clínica." />
          </Helmet>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-6 space-y-6"
          >
            <header>
              <h1 className="text-3xl font-bold tracking-tight flex items-center text-white">
                <Gem className="mr-3 h-8 w-8 text-emerald-400" />
                Espaço do Paciente
              </h1>
              <p className="text-violet-200">
                Bem-vindo(a), {profile.first_name}! Este é o seu canal exclusivo com a clínica.
              </p>
            </header>
            
            <Tabs defaultValue="scheduling" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scheduling"><Calendar className="mr-2 h-4 w-4" />Agendar Bate-papo</TabsTrigger>
                <TabsTrigger value="communication"><MessageSquare className="mr-2 h-4 w-4" />Canal de Mensagens</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scheduling" className="mt-4">
                <PatientScheduling patientId={patientId} />
              </TabsContent>
              
              <TabsContent value="communication" className="mt-4">
                 <PatientCommunication patientId={patientId} />
              </TabsContent>
            </Tabs>
            
          </motion.div>
        </>
      );
    };

    export default PatientSchedulingPage;