import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, DollarSign, AlertTriangle, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const QuoteManagementPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase.from('quotes').select('*, patient:patient_id(full_name)').order('created_at', { ascending: false });
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setQuotes(data || []);
    } catch (err) {
      setError("Não foi possível carregar os orçamentos.");
      toast({ title: "Erro ao carregar orçamentos", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, statusFilter]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const getStatusVariant = (status) => {
    const variants = {
      'Pendente': 'default',
      'Enviado': 'info',
      'Aceito': 'success',
      'Recusado': 'destructive',
    };
    return variants[status] || 'default';
  };

  return (
    <>
      <Helmet>
        <title>Gerenciamento de Orçamentos</title>
      </Helmet>
      <Card className="card-glass">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <DollarSign /> Gerenciamento de Orçamentos
              </CardTitle>
              <CardDescription>Visualize e gerencie todos os orçamentos do sistema.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-violet-300" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Aceito">Aceito</SelectItem>
                  <SelectItem value="Recusado">Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : error ? (
            <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
              <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
              <p className="font-semibold">Erro ao Carregar Orçamentos</p>
              <p className="text-sm">{error}</p>
              <Button onClick={fetchQuotes} variant="outline" className="mt-4">Tentar Novamente</Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.length > 0 ? quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{quote.patient?.full_name || 'N/A'}</TableCell>
                      <TableCell>{quote.procedure_name}</TableCell>
                      <TableCell>{(quote.total_value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(quote.status)}>{quote.status}</Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">Nenhum orçamento encontrado para este filtro.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default QuoteManagementPage;