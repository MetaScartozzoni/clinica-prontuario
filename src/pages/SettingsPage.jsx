
import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Settings as SettingsIcon, Users, Lock, Database, HeartPulse, FileText, Bot, DollarSign, Stethoscope, Video, ShieldCheck, Clock } from 'lucide-react';
    import { motion } from 'framer-motion';

    import UserManagementSettings from '@/components/settings/UserManagementSettings';
    import GoogleAuthSettings from '@/components/settings/GoogleAuthSettings';
    import AuthSetupGuide from '@/components/settings/AuthSetupGuide';
    import AuditTrailViewer from '@/components/settings/AuditTrailViewer';
    import BackupAndRollback from '@/components/settings/BackupAndRollback';
    import SystemHealth from '@/components/settings/SystemHealth';
    import PoliciesAndNorms from '@/components/settings/PoliciesAndNorms';
    import DataImport from '@/components/settings/DataImport';
    import SystemParameters from '@/components/settings/SystemParameters';
    import CommunicationSettings from '@/components/settings/CommunicationSettings';
    import QuoteSettings from '@/components/settings/QuoteSettings';
    import ProcedureSettings from '@/components/settings/ProcedureSettings';
    import TelemedicineSettings from '@/components/settings/TelemedicineSettings';
    import PermissionManagement from '@/components/settings/PermissionManagement';
    import AvailabilitySettings from '@/components/settings/AvailabilitySettings';

    const SettingsPage = () => {
      const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
      };
      const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

      const searchParams = new URLSearchParams(window.location.search);
      const defaultTab = searchParams.get('tab') || 'system';

      return (
        <>
          <Helmet>
            <title>Configurações do Sistema</title>
            <meta name="description" content="Gerencie as configurações gerais da clínica, usuários, integrações e mais." />
          </Helmet>
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
          >
            <header>
              <h1 className="text-3xl font-bold tracking-tight flex items-center text-white">
                <SettingsIcon className="mr-3 h-8 w-8 text-violet-400" />
                Configurações do Sistema
              </h1>
              <p className="text-violet-200">
                Ajustes de segurança, permissões, integrações e parâmetros da clínica.
              </p>
            </header>

            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-11 gap-2 h-auto flex-wrap">
                <TabsTrigger value="system"><HeartPulse className="mr-2 h-4 w-4"/>Sistema</TabsTrigger>
                <TabsTrigger value="users"><Users className="mr-2 h-4 w-4"/>Usuários</TabsTrigger>
                <TabsTrigger value="permissions"><ShieldCheck className="mr-2 h-4 w-4"/>Permissões</TabsTrigger>
                 <TabsTrigger value="availability"><Clock className="mr-2 h-4 w-4"/>Disponibilidade</TabsTrigger>
                <TabsTrigger value="auth"><Lock className="mr-2 h-4 w-4"/>Autenticação</TabsTrigger>
                <TabsTrigger value="data"><Database className="mr-2 h-4 w-4"/>Dados & Logs</TabsTrigger>
                <TabsTrigger value="procedures"><Stethoscope className="mr-2 h-4 w-4"/>Procedimentos</TabsTrigger>
                <TabsTrigger value="commercial"><DollarSign className="mr-2 h-4 w-4"/>Comercial</TabsTrigger>
                <TabsTrigger value="telemedicine"><Video className="mr-2 h-4 w-4"/>Telemedicina</TabsTrigger>
                <TabsTrigger value="communication"><Bot className="mr-2 h-4 w-4"/>Comunicação</TabsTrigger>
                <TabsTrigger value="docs"><FileText className="mr-2 h-4 w-4"/>Documentos</TabsTrigger>
              </TabsList>
              
              <motion.div
                key="tab-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <TabsContent value="system" className="space-y-6">
                  <SystemParameters />
                  <SystemHealth />
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                  <UserManagementSettings />
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-6">
                  <PermissionManagement />
                </TabsContent>

                 <TabsContent value="availability" className="space-y-6">
                  <AvailabilitySettings />
                </TabsContent>

                <TabsContent value="auth" className="space-y-6">
                  <AuthSetupGuide />
                  <GoogleAuthSettings />
                </TabsContent>
                
                <TabsContent value="data" className="space-y-6">
                  <AuditTrailViewer />
                  <BackupAndRollback />
                  <DataImport />
                </TabsContent>

                <TabsContent value="procedures" className="space-y-6">
                  <ProcedureSettings />
                </TabsContent>

                <TabsContent value="commercial" className="space-y-6">
                  <QuoteSettings />
                </TabsContent>

                <TabsContent value="telemedicine" className="space-y-6">
                  <TelemedicineSettings />
                </TabsContent>

                <TabsContent value="communication" className="space-y-6">
                  <CommunicationSettings />
                </TabsContent>

                <TabsContent value="docs" className="space-y-6">
                  <PoliciesAndNorms />
                </TabsContent>
              </motion.div>
            </Tabs>
          </motion.div>
        </>
      );
    };

    export default SettingsPage;
