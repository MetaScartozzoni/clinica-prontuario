
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GitMerge, Share2, UserPlus, Database, Key, FileJson, Webhook } from 'lucide-react';
import PublicAuthSetupGuide from '@/components/docs/PublicAuthSetupGuide';
import PublicGoogleAuthSettings from '@/components/docs/PublicGoogleAuthSettings';
import DataEcosystemGuide from '@/components/docs/DataEcosystemGuide';
import ApiIntegrationGuide from '@/components/docs/ApiIntegrationGuide';
import FutureIntegrationsGuide from '@/components/docs/FutureIntegrationsGuide';

const DocumentationCenterPage = () => {
  const tabs = [
    { value: 'auth', label: 'Config. de Autenticação', icon: UserPlus, component: <PublicAuthSetupGuide /> },
    { value: 'googleAuth', label: 'Login com Google', icon: Key, component: <PublicGoogleAuthSettings /> },
    { value: 'ecosystem', label: 'Ecossistema de Dados', icon: GitMerge, component: <DataEcosystemGuide /> },
    { value: 'api', label: 'Integração via API', icon: Webhook, component: <ApiIntegrationGuide /> },
    { value: 'future', label: 'Expansão Futura', icon: Share2, component: <FutureIntegrationsGuide /> },
  ];

  return (
    <>
      <Helmet>
        <title>Central de Documentação</title>
        <meta name="description" content="Documentação técnica e guias para configuração e integração do sistema da clínica." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 lg:p-8"
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center text-white">
            <BookOpen className="mr-3 h-8 w-8 text-violet-400" />
            Central de Documentação Técnica
          </h1>
          <p className="text-violet-200 mt-1">
            Guias para configurar, integrar e expandir o seu sistema.
          </p>
        </header>

        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </>
  );
};

export default DocumentationCenterPage;
