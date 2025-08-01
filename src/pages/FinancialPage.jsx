import React, { useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CashFlowWrapper from '@/components/financial/CashFlowWrapper'; 
import AccountsPayable from '@/components/financial/AccountsPayable';
import FinancialReports from '@/components/financial/FinancialReports';
import PaymentProofs from '@/components/financial/PaymentProofs';
import ProviderPayroll from '@/components/financial/ProviderPayroll';
import CompanyCashWrapper from '@/components/financial/CompanyCashWrapper';
import ProtectedContent from '@/components/general/ProtectedContent';
import FinancialCalendarView from '@/components/financial/FinancialCalendarView';
import { DollarSign, FileText, BarChart2, UploadCloud, Users, Banknote, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthRole from '@/hooks/useAuthRole';

const FinancialPage = () => {
  const { hasRole } = useAuthRole();
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4,
  };

  const cashFlowRef = useRef(null);

  const handleTransferComplete = () => {
    if (cashFlowRef.current && typeof cashFlowRef.current.refreshCashFlowData === 'function') {
      cashFlowRef.current.refreshCashFlowData();
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto p-0 md:p-4"
    >
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-pink-300">
          Painel Financeiro
        </h1>
        <p className="text-violet-200 text-lg">
          Gerencie o fluxo de caixa, contas, relatórios e pagamentos da clínica.
        </p>
      </header>

      <Tabs defaultValue={hasRole('admin_financeiro') ? 'reports' : 'accountsPayable'} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 mb-6">
          <ProtectedContent requiredRole={['admin_financeiro']}>
            <TabsTrigger value="reports">
              <BarChart2 className="w-4 h-4 mr-2" /> Relatórios
            </TabsTrigger>
          </ProtectedContent>
          <ProtectedContent requiredRole={['admin_financeiro']}>
            <TabsTrigger value="cashflow">
              <DollarSign className="w-4 h-4 mr-2" /> Fluxo de Caixa
            </TabsTrigger>
          </ProtectedContent>
           <ProtectedContent requiredRole={['admin_financeiro', 'comercial']}>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" /> Calendário
            </TabsTrigger>
           </ProtectedContent>
          <ProtectedContent requiredRole={['admin_financeiro', 'comercial']}>
            <TabsTrigger value="accountsPayable">
              <FileText className="w-4 h-4 mr-2" /> Contas a Pagar
            </TabsTrigger>
          </ProtectedContent>
           <ProtectedContent requiredRole={['admin_financeiro', 'comercial']}>
            <TabsTrigger value="providerPayroll">
              <Users className="w-4 h-4 mr-2" /> Pagto. Prestadores
            </TabsTrigger>
          </ProtectedContent>
          <ProtectedContent requiredRole={['admin_financeiro', 'comercial']}>
            <TabsTrigger value="paymentProofs">
              <UploadCloud className="w-4 h-4 mr-2" /> Comprovantes
            </TabsTrigger>
          </ProtectedContent>
          <ProtectedContent requiredRole="admin_financeiro">
            <TabsTrigger value="companyCash">
              <Banknote className="w-4 h-4 mr-2" /> Caixa Empresa
            </TabsTrigger>
          </ProtectedContent>
        </TabsList>

        <ProtectedContent requiredRole={['admin_financeiro']}>
            <TabsContent value="reports">
              <FinancialReports />
            </TabsContent>
            <TabsContent value="cashflow">
              <CashFlowWrapper ref={cashFlowRef} />
            </TabsContent>
            <TabsContent value="companyCash">
                <CompanyCashWrapper onTransferComplete={handleTransferComplete} cashFlowRef={cashFlowRef} />
            </TabsContent>
        </ProtectedContent>

        <ProtectedContent requiredRole={['admin_financeiro', 'comercial']}>
            <TabsContent value="calendar">
                <FinancialCalendarView />
            </TabsContent>
            <TabsContent value="accountsPayable">
                <AccountsPayable />
            </TabsContent>
            <TabsContent value="providerPayroll">
                <ProviderPayroll />
            </TabsContent>
            <TabsContent value="paymentProofs">
                <PaymentProofs />
            </TabsContent>
        </ProtectedContent>
      </Tabs>
    </motion.div>
  );
};

export default FinancialPage;