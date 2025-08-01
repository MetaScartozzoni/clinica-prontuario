import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { UploadCloud, Loader2, Trash2, Eye, File, Link as LinkIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';

const BUCKET_NAME = 'system-assets';

const categoryOptions = [
  { value: 'logo', label: 'Logotipo' },
  { value: 'contract_template', label: 'Modelo de Contrato' },
  { value: 'receipt_template', label: 'Modelo de Recibo' },
  { value: 'policy', label: 'Política Interna' },
  { value: 'other_template', label: 'Outro Template' },
];

const UploadsAndTemplates = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('uploaded_files').select('*').eq('bucket_name', BUCKET_NAME).order('created_at', { ascending: false });
      if (error) throw error;
      setUploadedFiles(data);
    } catch (error) {
      toast({ title: 'Erro ao buscar arquivos', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !category) {
      toast({ title: 'Campos obrigatórios', description: 'Por favor, selecione um arquivo e uma categoria.', variant: 'destructive' });
      return;
    }
    if (!session) {
      toast({ title: 'Não autenticado', description: 'Sessão de usuário não encontrada.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      const filePath = `${session.user.id}/${category}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      
      const fileMetadata = {
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        bucket_name: BUCKET_NAME,
        category,
        uploaded_by: session.user.id
      };

      const { error: dbError } = await supabase.from('uploaded_files').insert(fileMetadata);
      if (dbError) throw dbError;

      toast({ title: 'Upload bem-sucedido!', description: `${file.name} foi enviado.`, variant: 'success' });
      setFile(null);
      setCategory('');
      const fileInput = document.getElementById('file-upload-input');
      if(fileInput) fileInput.value = '';
      fetchFiles();
    } catch (error) {
      toast({ title: 'Erro no Upload', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId, fileUrl) => {
    if (!window.confirm("Tem certeza que deseja excluir este arquivo?")) return;
    try {
        const path = new URL(fileUrl).pathname.split(`/${BUCKET_NAME}/`)[1];
        const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([path]);
        if(storageError) console.warn("Could not delete from storage, but proceeding: ", storageError.message);

        const { error: dbError } = await supabase.from('uploaded_files').delete().eq('id', fileId);
        if(dbError) throw dbError;

        toast({title: "Arquivo excluído", variant: "success"});
        fetchFiles();

    } catch(error){
        toast({title: "Erro ao excluir arquivo", description: error.message, variant: "destructive"});
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-6 w-6 text-primary" /> Uploads e Templates
        </CardTitle>
        <CardDescription>Envie arquivos como logotipo da clínica, modelos de contrato, recibos e outras políticas internas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-card-foreground/5 space-y-4">
          <h3 className="font-semibold">Novo Upload</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="category-select">Categoria do Arquivo</Label>
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger id="category-select"><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="file-upload-input">Arquivo</Label>
              <Input id="file-upload-input" type="file" onChange={handleFileChange} />
            </div>
          </div>
          <Button onClick={handleUpload} disabled={isUploading} className="btn-primary-frutacor">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Enviar Arquivo
          </Button>
        </div>

        <div className="space-y-4">
            <h3 className="font-semibold">Arquivos Enviados</h3>
            {isLoading ? <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin"/></div> : (
                <div className="border rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Nome do Arquivo</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Categoria</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Data</th>
                                <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {uploadedFiles.map(f => (
                                <tr key={f.id} className="hover:bg-muted/20">
                                    <td className="px-4 py-2 flex items-center gap-2"><File className="h-4 w-4 text-muted-foreground"/> {f.file_name}</td>
                                    <td className="px-4 py-2">{categoryOptions.find(c => c.value === f.category)?.label || f.category}</td>
                                    <td className="px-4 py-2 text-sm text-muted-foreground">{format(new Date(f.created_at), 'dd/MM/yyyy')}</td>
                                    <td className="px-4 py-2 text-right">
                                        <a href={f.file_url} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="icon"><Eye className="h-4 w-4"/></Button></a>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id, f.file_url)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            { !isLoading && uploadedFiles.length === 0 && <p className="text-center text-muted-foreground py-4">Nenhum arquivo encontrado.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadsAndTemplates;