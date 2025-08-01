import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, Users, Calendar, DollarSign, Stethoscope, FileText } from 'lucide-react';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard</title>
        <meta name="description" content="Visão geral e acesso rápido às principais funcionalidades da clínica." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-blue-900/20 rounded-lg shadow-inner"
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center text-white">
            <LayoutDashboard className="mr-3 h-8 w-8 text-violet-400" />
            Dashboard Principal
          </h1>
          <p className="text-violet-200">
            Bem-vindo(a) ao seu centro de comando!
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-pink-400" />
                Pacientes
              </CardTitle>
              <CardDescription>Gerencie todos os seus pacientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">120</p>
              <p className="text-sm text-violet-300">pacientes ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-400" />
                Agenda
              </CardTitle>
              <CardDescription>Visualize e gerencie seus agendamentos.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">15</p>
              <p className="text-sm text-violet-300">consultas hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="mr-2 h-5 w-5 text-green-400" />
                Cirurgias
              </CardTitle>
              <CardDescription>Acompanhe o status das cirurgias.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">5</p>
              <p className="text-sm text-violet-300">cirurgias agendadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-yellow-400" />
                Orçamentos
              </CardTitle>
              <CardDescription>Gerencie propostas e negociações.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">25</p>
              <p className="text-sm text-violet-300">orçamentos pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-teal-400" />
                Financeiro
              </CardTitle>
              <CardDescription>Controle suas finanças.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">R$ 15.000</p>
              <p className="text-sm text-violet-300">receita do mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LayoutDashboard className="mr-2 h-5 w-5 text-orange-400" />
                Outras Ações
              </CardTitle>
              <CardDescription>Acesso rápido a outras funcionalidades.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-violet-300">
                Explore o menu lateral para mais opções.
              </p>
            </CardContent>
          </Card>
        </section>
      </motion.div>
    </>
  );
};

export default HomePage;