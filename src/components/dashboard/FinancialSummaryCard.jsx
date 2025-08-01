import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DollarSign, Loader2 } from 'lucide-react';

const FinancialSummaryCard = ({ financialSummary, isLoading }) => {
  const summary = financialSummary || { totalRevenue: 0, expenses: 0, netProfit: 0 };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><DollarSign className="mr-2 h-6 w-6 text-green-400" /> Resumo Financeiro (Mês Atual)</CardTitle>
        <CardDescription>Visão geral das finanças este mês. {isLoading ? "(Carregando...)" : ""}</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="md:col-span-3 flex justify-center items-center h-20">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="p-4 bg-green-700/20 rounded-lg text-center">
              <p className="text-sm text-green-300 font-medium">Receita Total</p>
              <p className="text-2xl font-bold text-green-400">R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 bg-red-700/20 rounded-lg text-center">
              <p className="text-sm text-red-300 font-medium">Despesas</p>
              <p className="text-2xl font-bold text-red-400">R$ {summary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 bg-blue-700/20 rounded-lg text-center">
              <p className="text-sm text-blue-300 font-medium">Lucro Líquido</p>
              <p className="text-2xl font-bold text-blue-400">R$ {summary.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

FinancialSummaryCard.defaultProps = {
  isLoading: false,
};

export default FinancialSummaryCard;