import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, Loader2, AlertTriangle, Search, Filter, Info } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AddEditAccountPayableModal from '@/components/financial/AddEditAccountPayableModal';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AccountsPayable = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState([]); 

  const accountPayableCategories = [
    "Fornecedores", "Aluguel", "Insumos", "Prestadores de Serviço", 
    "Social-Mídia", "Cafézinho", "Estudo - Capacitação", "Extras", "Impostos", "Software", "Marketing"
  ];
  const accountPayableStatuses = ["Pendente", "Pago", "Atrasado", "Cancelado"];


  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from('financial_accounts_payable').select('*').order('due_date', { ascending: true });

      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,supplier_name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }
      if (statusFilter.length > 0) {
        query = query.in('status', statusFilter);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setAccounts(data || []);
    } catch (err) {
      console.error("Erro ao buscar contas a pagar:", err);
      setError("Não foi possível carregar as contas a pagar. Tente novamente mais tarde.");
      toast({ title: "Erro ao Carregar Contas", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, searchTerm, statusFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.")) {
      return;
    }
    try {
      const { error: deleteError } = await supabase.from('financial_accounts_payable').delete().eq('id', accountId);
      if (deleteError) throw deleteError;
      toast({ title: "Conta Excluída", description: "A conta foi excluída com sucesso.", variant: "success" });
      fetchAccounts(); 
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      toast({ title: "Erro ao Excluir", description: err.message, variant: "destructive" });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Pago': return 'success';
      case 'Pendente': return 'default';
      case 'Atrasado': return 'destructive';
      case 'Cancelado': return 'secondary';
      default: return 'outline';
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  return (
    <Card className="custom-card w-full min-h-[400px] flex flex-col">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="card-title-custom">Contas a Pagar</CardTitle>
          <CardDescription className="text-card-foreground/80">Gerencie suas despesas e pagamentos pendentes.</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por descrição, fornecedor..."
              className="pl-8 sm:w-[200px] md:w-[250px] lg:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 w-full sm:w-auto">
                <Filter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filtrar Status
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
              <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accountPayableStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={() => handleStatusFilterChange(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleAddAccount} className="btn-frutacor w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Conta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6">
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Carregando contas...</p>
            <p className="text-sm">Por favor, aguarde.</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="flex flex-col justify-center items-center h-full text-destructive text-center">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">Erro ao Carregar</p>
            <p className="mb-4">{error}</p>
            <Button onClick={fetchAccounts} variant="outline" className="mt-4">Tentar Novamente</Button>
          </div>
        )}
        {!isLoading && !error && accounts.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full text-muted-foreground text-center">
             <Info className="h-12 w-12 mb-4 text-primary" />
            <p className="text-lg font-semibold">Nenhuma Conta a Pagar</p>
            <p>Adicione sua primeira conta clicando no botão "Adicionar Conta" acima.</p>
          </div>
        )}
        {!isLoading && !error && accounts.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-card-foreground/90">Vencimento</TableHead>
                  <TableHead className="text-card-foreground/90">Descrição</TableHead>
                  <TableHead className="text-card-foreground/90">Fornecedor</TableHead>
                  <TableHead className="text-card-foreground/90">Categoria</TableHead>
                  <TableHead className="text-right text-card-foreground/90">Valor</TableHead>
                  <TableHead className="text-center text-card-foreground/90">Status</TableHead>
                  <TableHead className="text-right text-card-foreground/90">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id} className="hover:bg-card-foreground/5">
                    <TableCell className="text-card-foreground/80">
                      {account.due_date ? format(parseISO(account.due_date), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </TableCell>
                    <TableCell className="font-medium text-card-foreground">{account.description}</TableCell>
                    <TableCell className="text-card-foreground/80">{account.supplier_name || '-'}</TableCell>
                    <TableCell className="text-card-foreground/80">{account.category || '-'}</TableCell>
                    <TableCell className="text-right text-card-foreground/80">
                      {account.amount ? `R$ ${account.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(account.status)}>{account.status || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditAccount(account)} className="text-blue-400 hover:text-blue-600">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {isModalOpen && (
        <AddEditAccountPayableModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            fetchAccounts();
          }}
          accountData={selectedAccount}
          categories={accountPayableCategories}
          statuses={accountPayableStatuses}
        />
      )}
    </Card>
  );
};

export default AccountsPayable;