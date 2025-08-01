import React, { useState, useEffect, useCallback } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Badge } from '@/components/ui/badge';
    import { Loader2, AlertCircle, ArrowLeft, FilePlus } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { format } from 'date-fns';
    import RequestExamModal from '@/components/exams/RequestExamModal';

    const ExamsPage = () => {
      const { patientId } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();
      const { user } = useAuth();

      const [patient, setPatient] = useState(null);
      const [exams, setExams] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);

      const fetchExams = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
          const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('first_name, last_name')
            .eq('id', patientId)
            .single();

          if (patientError) throw new Error('Paciente não encontrado.');
          setPatient(patientData);

          const { data: examsData, error: examsError } = await supabase
            .from('exams')
            .select('*, doctor:doctor_id(first_name, last_name)')
            .eq('patient_id', patientId)
            .order('request_date', { ascending: false });

          if (examsError) throw examsError;
          setExams(examsData);

        } catch (err) {
          setError(err.message);
          toast({ title: "Erro ao carregar dados", description: err.message, variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }, [patientId, toast]);

      useEffect(() => {
        fetchExams();
      }, [fetchExams]);

      const handleRequestSubmit = async (examData) => {
        const dataToSave = {
          ...examData,
          patient_id: patientId,
          doctor_id: user?.id,
        };

        const { error } = await supabase.from('exams').insert(dataToSave);

        if (error) {
          toast({ title: 'Erro ao solicitar exame', description: error.message, variant: 'destructive' });
          return false;
        }

        toast({ title: 'Exame solicitado com sucesso!', variant: 'success' });
        fetchExams(); // Refresh list
        return true;
      };

      const getStatusBadgeVariant = (status) => {
        switch (status) {
          case 'Realizado': return 'success';
          case 'Cancelado': return 'destructive';
          case 'Solicitado':
          default: return 'secondary';
        }
      };

      const renderContent = () => {
        if (isLoading) {
          return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-violet-400" /></div>;
        }
        if (error && !patient) {
          return (
            <div className="flex flex-col justify-center items-center h-64 text-destructive">
              <AlertCircle className="h-10 w-10 mb-2" />
              <p>{error}</p>
            </div>
          );
        }
        if (exams.length === 0) {
          return <div className="text-center h-64 flex flex-col justify-center items-center text-violet-300"><FilePlus className="h-10 w-10 mb-2" />Nenhum exame solicitado para este paciente.</div>;
        }

        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Solicitação</TableHead>
                <TableHead>Tipo do Exame</TableHead>
                <TableHead>Médico Solicitante</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map(exam => (
                <TableRow key={exam.id}>
                  <TableCell>{format(new Date(exam.request_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{exam.exam_type}</TableCell>
                  <TableCell>{exam.doctor ? `${exam.doctor.first_name} ${exam.doctor.last_name}` : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(exam.status)}>{exam.status}</Badge>
                  </TableCell>
                  <TableCell>{exam.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      };

      const patientFullName = patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Carregando...';

      return (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="page-title">Histórico de Exames</h1>
              <p className="page-subtitle">Paciente: {patientFullName}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/atendimento/${patientId}`)}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Ficha</Button>
                <Button className="btn-gradient" onClick={() => setIsModalOpen(true)}><FilePlus className="mr-2 h-4 w-4" /> Solicitar Novo Exame</Button>
            </div>
          </div>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Exames Solicitados</CardTitle>
              <CardDescription>Lista de todos os exames solicitados para o paciente.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderContent()}
            </CardContent>
          </Card>

          <RequestExamModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleRequestSubmit}
          />
        </>
      );
    };

    export default ExamsPage;