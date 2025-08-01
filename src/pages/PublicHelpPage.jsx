import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LifeBuoy, ArrowLeft } from 'lucide-react';
import PublicAuthSetupGuide from '@/components/docs/PublicAuthSetupGuide';
import PublicGoogleAuthSettings from '@/components/docs/PublicGoogleAuthSettings';

const PublicHelpPage = ({ internal = false }) => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Central de Ajuda</title>
        <meta name="description" content="Guias de configuração e ajuda para o sistema da Clínica." />
      </Helmet>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <header className="mb-8 text-center">
            <LifeBuoy className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Central de Ajuda</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Instruções essenciais para configurar e resolver problemas de acesso ao sistema.
            </p>
          </header>

          <main className="space-y-8">
            <PublicAuthSetupGuide />
            <PublicGoogleAuthSettings />
          </main>

          <footer className="mt-12 text-center">
            <Button onClick={() => internal ? navigate(-1) : navigate('/login')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </footer>
        </motion.div>
      </div>
    </>
  );
};

export default PublicHelpPage;