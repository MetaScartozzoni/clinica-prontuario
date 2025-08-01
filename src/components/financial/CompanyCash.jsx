import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CompanyCashTransferModal from '@/components/financial/CompanyCashTransferModal'; 
import CompanyCashBalanceDisplay from '@/components/financial/CompanyCashBalanceDisplay';
import CompanyCashHeader from '@/components/financial/CompanyCashHeader';
import CompanyCashTransferHistory from '@/components/financial/CompanyCashTransferHistory';

const COMPANY_CASH_CONFIG_ID = 1; 

const CompanyCash = ({ cashFlowRef }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [companyCashBalance, setCompanyCashBalance] = useState(0);
  const [transferHistory, setTransferHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferType, setTransferType] = useState(null); 

  const fetchCompanyCashData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: configData, error: configError } = await supabase
        .from('company_cash_config')
        .select('current_balance')
        .eq('id', COMPANY_CASH_CONFIG_ID)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }
      setCompanyCashBalance(configData?.current_balance || 0);

      let historyQuery = supabase
        .from('financial_transactions')
        .select('*')
        .or('description.eq.Transferência para Caixa da Empresa,description.eq.Transferência do Caixa da Empresa')
        .order('transaction_date', { ascending: false });

      const { data: historyData, error: historyError } = await historyQuery;
      if (historyError) throw historyError;
      setTransferHistory(historyData || []);

    } catch (err) {
      console.error("Erro ao buscar dados do caixa da empresa:", err);
      setError("Não foi possível carregar os dados. Tente novamente.");
      toast({ title: "Erro ao Carregar Dados", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCompanyCashData();
  }, [fetchCompanyCashData]);

  const handleOpenModal = (type) => {
    setTransferType(type);
    setIsModalOpen(true);
  };

  const handleTransferSuccess = async () => {
    setIsModalOpen(false);
    await fetchCompanyCashData();
    if (cashFlowRef && cashFlowRef.current && typeof cashFlowRef.current.refreshCashFlowData === 'function') {
      cashFlowRef.current.refreshCashFlowData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg text-foreground">Carregando Caixa da Empresa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        <AlertTriangle className="mx-auto h-12 w-12 mb-2" />
        <p className="text-lg font-semibold">Erro ao Carregar</p>
        <p>{error}</p>
        <Button onClick={fetchCompanyCashData} variant="outline" className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }
  
  return (
    <Card className="custom-card w-full">
      <CompanyCashHeader onOpenModal={handleOpenModal} />
      <CardContent className="space-y-6 p-6">
        <CompanyCashBalanceDisplay balance={companyCashBalance} />
        <CompanyCashTransferHistory history={transferHistory} />
        {isModalOpen && (
          <CompanyCashTransferModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleTransferSuccess}
            transferType={transferType}
            currentBalance={companyCashBalance}
            userId={user?.id}
            companyCashConfigId={COMPANY_CASH_CONFIG_ID}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyCash;