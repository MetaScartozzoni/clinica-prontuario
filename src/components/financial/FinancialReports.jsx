import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, parseISO, getYear } from 'date-fns';
import { motion } from 'framer-motion';
import { Loader2, RefreshCcw, AlertTriangle } from 'lucide-react';
import FinancialReportFilters from '@/components/financial/financial-reports/FinancialReportFilters';
import FinancialSummaryCards from '@/components/financial/financial-reports/FinancialSummaryCards';
import FinancialCharts from '@/components/financial/financial-reports/FinancialCharts';

const FinancialReports = () => {
  const { toast } = useToast();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [availableMonths, setAvailableMonths] = useState([]);
  const [error, setError] = useState(null);

  const fetchAvailableMonths = useCallback(async () => {
    try {
      const { data: distinctMonthsData, error: distinctMonthsError } = await supabase.rpc('get_distinct_financial_report_months');
      if (distinctMonthsError) {
        console.error("Error fetching distinct months via RPC:", distinctMonthsError);
        const currentYear = getYear(new Date());
        const defaultMonths = Array.from({ length: 12 }, (_, i) => {
          const monthNum = (i + 1).toString().padStart(2, '0');
          return { value: `${currentYear}-${monthNum}`, label: format(new Date(currentYear, i), 'MMMM/yyyy') };
        });
        setAvailableMonths(defaultMonths.sort((a,b) => b.value.localeCompare(a.value)));
        return;
      }
      
      if (distinctMonthsData && distinctMonthsData.length > 0) {
        const formattedMonths = distinctMonthsData
          .filter(item => item.month_year)
          .map(item => ({
            value: item.month_year,
            label: format(parseISO(item.month_year + '-01'), 'MMMM/yyyy')
          }))
          .sort((a,b) => b.value.localeCompare(a.value));
        setAvailableMonths(formattedMonths);
        if (formattedMonths.length > 0 && !formattedMonths.find(m => m.value === selectedMonth)) {
          setSelectedMonth(formattedMonths[0].value);
        }
      } else {
        const currentYear = getYear(new Date());
        const defaultMonths = Array.from({ length: 12 }, (_, i) => {
          const monthNum = (i + 1).toString().padStart(2, '0');
          return { value: `${currentYear}-${monthNum}`, label: format(new Date(currentYear, i), 'MMMM/yyyy') };
        });
        setAvailableMonths(defaultMonths.sort((a,b) => b.value.localeCompare(a.value)));
      }
    } catch (e) {
      console.error("Error processing distinct months:", e);
      const currentYear = getYear(new Date());
      const defaultMonths = Array.from({ length: 12 }, (_, i) => {
          const monthNum = (i + 1).toString().padStart(2, '0');
          return { value: `${currentYear}-${monthNum}`, label: format(new Date(currentYear, i), 'MMMM/yyyy') };
      });
      setAvailableMonths(defaultMonths.sort((a,b) => b.value.localeCompare(a.value)));
    }
  }, [selectedMonth]);

  const fetchReportData = useCallback(async (monthYear) => {
    setIsLoading(true);
    setReportData(null);
    setError(null);
    try {
      if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
        throw new Error("Formato de mês/ano inválido para o relatório.");
      }
      const [year, month] = monthYear.split('-');
      const startDate = format(startOfMonth(new Date(parseInt(year), parseInt(month) - 1)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(parseInt(year), parseInt(month) - 1)), 'yyyy-MM-dd');

      const { data: transactions, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('transaction_type, amount, category, payment_date')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);
      if (transactionsError) throw transactionsError;

      let totalIncome = 0;
      let totalExpenses = 0;
      const expensesByCategory = {};
      const incomeBySource = {};

      (transactions || []).forEach(t => {
        if (t.transaction_type === 'Entrada') {
          totalIncome += t.amount;
          incomeBySource[t.category || 'Outras Receitas'] = (incomeBySource[t.category || 'Outras Receitas'] || 0) + t.amount;
        } else if (t.transaction_type === 'Saída') {
          totalExpenses += t.amount;
          expensesByCategory[t.category || 'Outras Despesas'] = (expensesByCategory[t.category || 'Outras Despesas'] || 0) + t.amount;
        }
      });
      
      setReportData({
        totalIncome,
        totalExpenses,
        netResult: totalIncome - totalExpenses,
        expensesByCategory,
        incomeBySource,
        period: { startDate, endDate }
      });

    } catch (errorCatch) {
      setError(errorCatch.message || "Ocorreu um erro desconhecido ao gerar o relatório.");
      toast({ title: "Erro ao gerar relatório", description: errorCatch.message, variant: "destructive" });
      console.error("Report generation error:", errorCatch);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAvailableMonths();
  }, [fetchAvailableMonths]);

  useEffect(() => {
    if (selectedMonth && availableMonths.length > 0) {
        fetchReportData(selectedMonth);
    }
  }, [selectedMonth, fetchReportData, availableMonths]);

  const handleExport = () => {
    toast({ title: "Funcionalidade em Breve", description: "A exportação de relatórios será implementada em breve." });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="custom-card shadow-lg rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between p-6 bg-card-foreground/5">
          <div>
            <CardTitle className="text-2xl text-primary">Relatórios Financeiros</CardTitle>
            <CardDescription className="text-card-foreground/80">Analise as finanças da clínica por período.</CardDescription>
          </div>
          <Button onClick={() => fetchReportData(selectedMonth)} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <FinancialReportFilters 
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            availableMonths={availableMonths}
            onExport={handleExport}
            isLoading={isLoading}
            hasReportData={!!reportData}
          />

          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-3 text-lg text-muted-foreground">Gerando relatório...</p>
            </div>
          )}

          {!isLoading && error && (
             <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
                <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
                <p className="font-semibold">Erro ao Gerar Relatório</p>
                <p className="text-sm">{error}</p>
             </div>
          )}
          
          {!isLoading && !reportData && !error && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Selecione um período para gerar o relatório ou não há dados para o período selecionado.</p>
            </div>
          )}

          {!isLoading && reportData && !error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.2 }}
              className="space-y-8"
            >
              <FinancialSummaryCards reportData={reportData} />
              <FinancialCharts reportData={reportData} />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FinancialReports;