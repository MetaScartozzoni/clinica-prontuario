import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, TrendingUp, Repeat, Filter, Search, Download, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CashFlowTable from './CashFlowTable';

const transactionTypes = ["Entrada", "Saída"];
const transactionDescriptions = [
  "Receita de Paciente", "Pagamento de Conta", "Transferência para Caixa da Empresa", 
  "Transferência do Caixa da Empresa", "Investimento", "Outra Receita", "Outra Despesa"
];

const calculateCashFlowBalance = (allTransactions) => {
  let balance = 0;
  allTransactions.forEach(tx => {
    if (tx.transaction_type === 'Entrada') {
      balance += tx.amount || 0;
    } else if (tx.transaction_type === 'Saída') {
      balance -= tx.amount || 0;
    }
  });
  return balance;
};

const CashFlow = forwardRef((props, ref) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [cashFlowBalance, setCashFlowBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState([]);
  const [descriptionFilter, setDescriptionFilter] = useState([]);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from('financial_transactions').select('*').order('transaction_date', { ascending: false });

      if (searchTerm) {
        query = query.or(`patient_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`);
      }
      if (typeFilter.length > 0) {
        query = query.in('transaction_type', typeFilter);
      }
      if (descriptionFilter.length > 0) {
        query = query.in('description', descriptionFilter);
      }
      
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      
      setTransactions(data || []);
      setCashFlowBalance(calculateCashFlowBalance(data || []));

    } catch (err) {
      console.error("Erro ao buscar transações do fluxo de caixa:", err);
      setError("Não foi possível carregar as transações. Tente novamente mais tarde.");
      toast({ title: "Erro ao Carregar Transações", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, searchTerm, typeFilter, descriptionFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  useImperativeHandle(ref, () => ({
    refreshCashFlowData: fetchTransactions
  }));

  const handleTypeFilterChange = (type) => {
    setTypeFilter(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleDescriptionFilterChange = (desc) => {
    setDescriptionFilter(prev => 
      prev.includes(desc) ? prev.filter(s => s !== desc) : [...prev, desc]
    );
  };

  return (
    <Card className="custom-card w-full min-h-[400px] flex flex-col">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="card-title-custom flex items-center">
            <TrendingUp className="mr-2 h-6 w-6" /> Fluxo de Caixa
          </CardTitle>
          <CardDescription className="text-card-foreground/80">
            Acompanhe todas as entradas e saídas financeiras da clínica. Saldo Atual: 
            <span className={`font-bold ml-1 ${cashFlowBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {cashFlowBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
           <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar transações..."
              className="pl-8 sm:w-[200px] md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 w-full sm:w-auto">
                <Filter className="h-3.5 w-3.5" /> Tipo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
              <DropdownMenuLabel>Filtrar por Tipo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {transactionTypes.map((type) => (
                <DropdownMenuCheckboxItem key={type} checked={typeFilter.includes(type)} onCheckedChange={() => handleTypeFilterChange(type)}>
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 w-full sm:w-auto">
                <Filter className="h-3.5 w-3.5" /> Descrição
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
              <DropdownMenuLabel>Filtrar por Descrição</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {transactionDescriptions.map((desc) => (
                <DropdownMenuCheckboxItem key={desc} checked={descriptionFilter.includes(desc)} onCheckedChange={() => handleDescriptionFilterChange(desc)}>
                  {desc}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6">
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Carregando transações...</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="flex flex-col justify-center items-center h-full text-destructive text-center">
            <AlertTriangle className="mx-auto h-12 w-12 mb-2" />
            <p className="text-lg font-semibold">Erro ao Carregar</p>
            <p>{error}</p>
            <Button onClick={fetchTransactions} variant="outline" className="mt-4">Tentar Novamente</Button>
          </div>
        )}
        {!isLoading && !error && transactions.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-center">
            <Info className="h-12 w-12 mb-4 text-primary" />
            <p className="text-lg font-semibold">Nenhuma Transação</p>
            <p>As movimentações financeiras aparecerão aqui.</p>
          </div>
        )}
        {!isLoading && !error && transactions.length > 0 && (
          <CashFlowTable transactions={transactions} />
        )}
      </CardContent>
    </Card>
  );
});

CashFlow.displayName = "CashFlow";
export default CashFlow;