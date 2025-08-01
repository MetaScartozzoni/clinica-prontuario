import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';

const UserSettingsPage = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };
  const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

  return (
    <>
      <Helmet>
        <title>Minhas Configurações</title>
        <meta name="description" content="Gerencie seu perfil e configurações de segurança." />
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Minhas Configurações</h1>
          <p className="text-violet-200">
            Atualize suas informações de perfil e gerencie sua segurança.
          </p>
        </header>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile"><User className="mr-2 h-4 w-4"/>Perfil</TabsTrigger>
            <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4"/>Segurança</TabsTrigger>
          </TabsList>
          
          <motion.div
            key="tab-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>
            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
    </>
  );
};

export default UserSettingsPage;