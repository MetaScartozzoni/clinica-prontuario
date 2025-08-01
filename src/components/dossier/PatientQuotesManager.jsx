
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Eye, FileSignature, Edit } from 'lucide-react';
import CreateQuoteModal from '@/components/dossier/CreateQuoteModal';
import ScheduleSurgeryModal from '@/components/surgeries/ScheduleSurgeryModal';

const PatientQuotesManager = ({ patientId, patientName, onDataChange }) => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [quoteToSchedule, setQuoteToSchedule] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('quotes').select('*, surgery_type:surgery_type_id(name)').eq('patient_id', patientId).order('created_at', { ascending: false });
      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      toast({ title: "Erro ao buscar orçamentos", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [patientId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScheduleSurgery = (quote) => {
    const quoteDataForScheduling = {
      id: quote.id,
      patient_id: quote.patient_id,
      patient_name: patientName,
      surgery_type_id: quote.surgery_type_id,
      custom_surgery_name: quote.custom_surgery_name,
      observation: quote.observation,
    };
    setQuoteToSchedule(quoteDataForScheduling);
    setIsScheduleModalOpen(true);
  };

  const handleOpenQuoteModal = (quote = null) => {
    setEditingQuote(quote);
    setIsQuoteModalOpen(true);
  };
  
  const handleSuccess = () => {
    fetchData();
    if(onDataChange) onDataChange();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Aceito': return 'success';
      case 'Recusado': return 'destructive';
      case 'Enviado': return 'info';
      default: return 'default';
    }
  };

  return (
    <>
      <Card className="card-glass bg-transparent border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
          <div>
            <CardTitle className="text-2xl font-semibold text-violet-100">Orçamentos e Contratos</CardTitle>
          </div>
          <Button onClick={() => handleOpenQuoteModal()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Orçamento
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-10 rounded-lg bg-black/20">
              <p className="mt-4 text-violet-300">Nenhum orçamento encontrado para este paciente.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.custom_surgery_name || quote.surgery_type?.name || 'N/A'}</TableCell>
                      <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{(quote.total_value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(quote.status)}>{quote.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {quote.status === 'Aceito' && (
                          <Button variant="ghost" size="icon" title="Agendar Cirurgia" onClick={() => handleScheduleSurgery(quote)}>
                            <FileSignature className="h-4 w-4 text-green-400" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Editar Orçamento" onClick={() => handleOpenQuoteModal(quote)}>
                          <Edit className="h-4 w-4 text-yellow-400" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Ver Detalhes">
                          <Eye className="h-4 w-4 text-blue-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {isQuoteModalOpen && (
        <CreateQuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          patientId={patientId}
          patientName={patientName}
          onSuccess={handleSuccess}
          quoteData={editingQuote}
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleSurgeryModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          quoteToSchedule={quoteToSchedule}
          onSurgeryScheduled={() => {
            setIsScheduleModalOpen(false);
            handleSuccess();
          }}
        />
      )}
    </>
  );
};

export default PatientQuotesManager;
