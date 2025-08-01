import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, ListChecks, BadgeCheck, FileClock } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthRole from '@/hooks/useAuthRole';

const PurchasingPage = () => {
  const { hasRole } = useAuthRole();
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };
  const pageTransition = { type: "tween", ease: "anticipate", duration: 0.5 };

  return (
    <>
      <Helmet>
        <title>Compras e Suprimentos</title>
        <meta name="description" content="Gerencie todo o fluxo de compras e suprimentos da clínica." />
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <ShoppingCart className="mr-3 h-8 w-8 text-primary" />
            Compras e Suprimentos
          </h1>
          <p className="text-muted-foreground">
            Crie pedidos de compra, acompanhe aprovações e gerencie o estoque de insumos.
          </p>
        </header>

        <Tabs defaultValue="request" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="request"><ListChecks className="mr-2 h-4 w-4" />Solicitar Compra</TabsTrigger>
            {hasRole('admin_financeiro') && (
              <TabsTrigger value="approval"><BadgeCheck className="mr-2 h-4 w-4" />Aprovar Pedidos</TabsTrigger>
            )}
            <TabsTrigger value="history"><FileClock className="mr-2 h-4 w-4" />Histórico de Pedidos</TabsTrigger>
            {hasRole('admin_financeiro') && (
                <TabsTrigger value="supplies"><ListChecks className="mr-2 h-4 w-4" />Gerenciar Insumos</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="request" className="mt-6">
            <p>Formulário de solicitação de compra.</p>
          </TabsContent>
          {hasRole('admin_financeiro') && (
            <TabsContent value="approval" className="mt-6">
              <p>Fila de pedidos pendentes de aprovação.</p>
            </TabsContent>
          )}
          <TabsContent value="history" className="mt-6">
            <p>Tabela com o histórico de todos os pedidos.</p>
          </TabsContent>
           {hasRole('admin_financeiro') && (
            <TabsContent value="supplies" className="mt-6">
              <p>Tabela para gerenciar o cadastro de insumos.</p>
            </TabsContent>
          )}
        </Tabs>
      </motion.div>
    </>
  );
};

export default PurchasingPage;