import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ListOrdered, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ITEMS_PER_PAGE = 15;

const AuditTrailViewer = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error: fetchError, count: totalCount } = await supabase
        .from('auth_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;
      
      setLogs(data || []);
      setCount(totalCount || 0);

    } catch (err) {
      console.error("Erro ao buscar logs de auditoria:", err);
      setError("Não foi possível carregar os logs. Tente novamente mais tarde.");
      toast({ title: "Erro ao Carregar Logs", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const maxPage = Math.ceil(count / ITEMS_PER_PAGE) - 1;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListOrdered /> Trilha de Auditoria
        </CardTitle>
        <CardDescription>Visualize todos os eventos de login, logout e outras ações de autenticação e modificação de dados.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : error ? (
           <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
            <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
            <p className="font-semibold">Erro ao Carregar Logs</p>
            <p className="text-sm">{error}</p>
            <Button onClick={fetchLogs} variant="outline" className="mt-4">Tentar Novamente</Button>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Email do Usuário</TableHead>
                    <TableHead>Endereço IP</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.created_at), "dd/MM/yy HH:mm:ss", { locale: ptBR })}</TableCell>
                      <TableCell className="font-medium">{log.event_type}</TableCell>
                      <TableCell>{log.user_email}</TableCell>
                      <TableCell>{log.ip_address}</TableCell>
                      <TableCell className="text-xs max-w-sm truncate">{log.details ? JSON.stringify(log.details) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                Mostrando {page * ITEMS_PER_PAGE + 1} - {Math.min((page + 1) * ITEMS_PER_PAGE, count)} de {count} logs
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(maxPage, p + 1))} disabled={page >= maxPage}>
                  Próximo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditTrailViewer;