import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Upload, FileText, Download, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

const BUCKET_NAME = 'policies-and-terms';

const PoliciesAndNorms = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar políticas',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setIsUploading(true);
    
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`${file.name}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;
      
      toast({
        title: 'Upload Concluído!',
        description: `O arquivo '${file.name}' foi salvo com sucesso.`,
        variant: 'success',
      });
      fetchPolicies();
    } catch (error) {
      toast({
        title: 'Erro no Upload',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast, fetchPolicies]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleDownload = async (fileName) => {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).download(fileName);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Erro no Download',
        description: `Não foi possível baixar o arquivo: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (fileName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      if (error) throw error;
      toast({
        title: 'Arquivo Excluído',
        description: `O arquivo '${fileName}' foi removido com sucesso.`,
        variant: 'success',
      });
      fetchPolicies();
    } catch (error) {
      toast({
        title: 'Erro ao Excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-6 w-6 text-violet-400" /> Políticas e Normas Internas</CardTitle>
        <CardDescription>Gerencie os documentos de conformidade, termos de uso e políticas de privacidade da clínica.</CardDescription>
      </CardHeader>
      <CardContent>
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-violet-400 bg-violet-500/10' : 'border-white/20 hover:border-violet-400/50'}`}>
          <input {...getInputProps()} />
          {isUploading ? (
             <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                <p className="mt-4 text-violet-200">Enviando arquivo...</p>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-violet-400" />
              <p className="mt-4 text-violet-200">Arraste e solte um arquivo PDF aqui, ou clique para selecionar.</p>
              <p className="text-xs text-violet-400 mt-1">Apenas arquivos .pdf são aceitos.</p>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Documentos Atuais</h3>
          {isLoading ? (
            <div className="flex justify-center items-center p-6"><Loader2 className="h-8 w-8 animate-spin text-violet-300"/></div>
          ) : files.length === 0 ? (
            <div className="text-center py-6 bg-black/20 rounded-lg">
                <AlertCircle className="mx-auto h-10 w-10 text-violet-400" />
                <p className="mt-2 text-violet-300">Nenhum documento de política encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Arquivo</TableHead>
                    <TableHead>Última Modificação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-violet-300" />
                        {file.name}
                      </TableCell>
                      <TableCell>{new Date(file.updated_at || file.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleDownload(file.name)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(file.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliciesAndNorms;