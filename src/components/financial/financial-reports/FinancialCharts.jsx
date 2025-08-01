import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const FinancialCharts = ({ reportData }) => {
  if (!reportData) return null;

  const incomeExpenseChartData = {
    labels: ['Receitas', 'Despesas'],
    datasets: [
      {
        label: 'Total (R$)',
        data: [reportData.totalIncome || 0, reportData.totalExpenses || 0],
        backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  const expensesByCategoryChartData = {
    labels: Object.keys(reportData.expensesByCategory || {}),
    datasets: [
      {
        label: 'Despesas por Categoria (R$)',
        data: Object.values(reportData.expensesByCategory || {}),
        backgroundColor: Object.keys(reportData.expensesByCategory || {}).map((_, i) => `hsl(${i * 360 / (Object.keys(reportData.expensesByCategory || {}).length || 1)}, 70%, 60%)`),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: 'hsl(var(--foreground))' } },
      title: { display: true, text: 'Resumo Financeiro do Período', color: 'hsl(var(--foreground))' },
      tooltip: { callbacks: { label: (context) => `${context.label}: R$ ${parseFloat(context.raw).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` } }
    },
    scales: {
        x: { ticks: { color: 'hsl(var(--muted-foreground))' }, grid: { color: 'hsl(var(--border))' } },
        y: { ticks: { color: 'hsl(var(--muted-foreground))' }, grid: { color: 'hsl(var(--border))' } }
    }
  };
  
  const pieChartOptions = { ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Distribuição de Despesas', color: 'hsl(var(--foreground))' } }};

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[350px]"
      variants={chartVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader><CardTitle className="text-card-foreground">Receitas vs. Despesas</CardTitle></CardHeader>
          <CardContent className="h-[300px] sm:h-[350px]">
            <Bar data={incomeExpenseChartData} options={chartOptions} />
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader><CardTitle className="text-card-foreground">Despesas por Categoria</CardTitle></CardHeader>
          <CardContent className="h-[300px] sm:h-[350px]">
            {Object.keys(reportData.expensesByCategory).length > 0 ? (
                <Pie data={expensesByCategoryChartData} options={pieChartOptions} />
            ) : (
                <p className="text-center text-muted-foreground pt-10">Nenhuma despesa registrada para este período.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default FinancialCharts;