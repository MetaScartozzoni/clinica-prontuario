import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const FinancialSummaryCards = ({ reportData }) => {
  if (!reportData) return null;

  const { totalIncome, totalExpenses, netResult } = reportData;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-green-500/10 border-green-500/30 hover:shadow-xl transition-shadow">
          <CardHeader><CardTitle className="text-green-400">Total de Receitas</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-300">R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="bg-red-500/10 border-red-500/30 hover:shadow-xl transition-shadow">
          <CardHeader><CardTitle className="text-red-400">Total de Despesas</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-300">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className={`${netResult >= 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-orange-500/10 border-orange-500/30'} hover:shadow-xl transition-shadow`}>
          <CardHeader><CardTitle className={`${netResult >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>Resultado Líquido</CardTitle></CardHeader>
          <CardContent><p className={`text-3xl font-bold ${netResult >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>R$ {netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default FinancialSummaryCards;