
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'react-router-dom';
import { Users, Shield, Sliders, Database, UploadCloud, HeartPulse, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

import UserManagementSettings from '@/components/settings/UserManagementSettings';
import PermissionManagement from '@/components/settings/PermissionManagement';
import SystemParameters from '@/components/settings/SystemParameters';
import AuditTrailViewer from '@/components/settings/AuditTrailViewer';
import DataImport from '@/components/settings/DataImport';
import SystemHealth from '@/components/settings/SystemHealth';
import UploadsAndTemplates from '@/components/settings/UploadsAndTemplates';

const AdminSettingsPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const defaultTab = searchParams.get('tab') || 'users';

    const tabsConfig = [
        { value: 'users', label: 'Usuários', icon: Users, component: <UserManagementSettings /> },
        { value: 'permissions', label: 'Permissões', icon: Shield, component: <PermissionManagement /> },
        { value: 'parameters', label: 'Parâmetros', icon: Sliders, component: <SystemParameters /> },
        { value: 'data', label: 'Dados & Logs', icon: Database, component: <><AuditTrailViewer /><div className="mt-6"><UploadsAndTemplates /></div><div className="mt-6"><DataImport /></div></> },
        { value: 'health', label: 'Saúde do Sistema', icon: HeartPulse, component: <SystemHealth /> },
    ];

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

  return (
    <>
      <Helmet>
        <title>Configurações do Sistema</title>
        <meta name="description" content="Gerencie as configurações avançadas do sistema da clínica." />
      </Helmet>
      <motion.div 
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ type: "tween", ease: "anticipate", duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Configurações do Sistema</h1>
          <p className="text-muted-foreground">Ajustes globais, segurança e gerenciamento de dados.</p>
        </div>
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {tabsConfig.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                    <tab.icon className="w-4 h-4 mr-2" />{tab.label}
                </TabsTrigger>
            ))}
          </TabsList>
          
          {tabsConfig.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="p-0 md:p-4 space-y-6">
                {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </>
  );
};

export default AdminSettingsPage;
