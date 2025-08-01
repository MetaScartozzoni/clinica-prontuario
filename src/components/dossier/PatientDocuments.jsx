import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Upload, FileText, Download, Trash2, AlertCircle } from 'lucide-react';
import UploadDocumentModal from './UploadDocumentModal';

const PatientDocuments = ({ patientId, onUploadSuccess }) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao buscar documentos', description: error.message, variant: 'destructive' });
    } else {
      setDocuments(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (patientId) {
      fetchDocuments();
    }
  }, [patientId]);
  
  useEffect(() => {
    const subscription = supabase
      .channel(`patient_documents_${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_documents', filter: `patient_id=eq.${patientId}` }, (payload) => {
        fetchDocuments();
        if (onUploadSuccess) onUploadSuccess();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    }
  }, [patientId, onUploadSuccess])


  const handleDownload = async (filePath) => {
    const { data, error } = await supabase.storage.from('patient_documents').download(filePath);
    if (error) {
      toast({ title: 'Erro no download', description: error.message, variant: 'destructive' });
      return;
    }
    const blob = new Blob([data], { type: data.type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop();
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      <Card className="card-glass bg-transparent border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
          <div>
            <CardTitle className="text-2xl font-semibold text-violet-100">Documentos Anexados</CardTitle>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Adicionar Documento
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 rounded-lg bg-black/20">
              <FileText className="mx-auto h-12 w-12 text-violet-400" />
              <p className="mt-4 text-violet-300">Nenhum documento encontrado.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Arquivo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data de Envio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-white/5">
                      <TableCell className="font-medium">{doc.file_name}</TableCell>
                      <TableCell>{doc.description || '-'}</TableCell>
                      <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.file_path)}>
                          <Download className="h-4 w-4" />
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
      {isModalOpen && (
        <UploadDocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patientId={patientId}
          onUploadSuccess={() => {
            fetchDocuments();
            if(onUploadSuccess) onUploadSuccess();
          }}
        />
      )}
    </>
  );
};

export default PatientDocuments;