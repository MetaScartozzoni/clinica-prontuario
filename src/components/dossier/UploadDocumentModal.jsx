import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud, File, X } from 'lucide-react';

const UploadDocumentModal = ({ isOpen, onClose, patientId, onUploadSuccess }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const removeFile = (file) => {
    setFiles(files.filter(f => f !== file));
    URL.revokeObjectURL(file.preview);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: 'Nenhum arquivo selecionado', description: 'Por favor, adicione um arquivo para enviar.', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      toast({ title: "Erro de autenticação", description: "Não foi possível identificar o autor. Faça login novamente.", variant: "destructive" });
      setIsUploading(false);
      return;
    }

    for (const file of files) {
      const filePath = `public/${patientId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('patient_documents')
        .upload(filePath, file);

      if (uploadError) {
        toast({ title: `Erro ao enviar ${file.name}`, description: uploadError.message, variant: 'destructive' });
        continue;
      }

      const { error: dbError } = await supabase
        .from('patient_documents')
        .insert({
          patient_id: patientId,
          uploaded_by_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          description: description,
        });

      if (dbError) {
        toast({ title: `Erro ao salvar ${file.name} no banco`, description: dbError.message, variant: 'destructive' });
      } else {
        toast({ title: 'Upload bem-sucedido!', description: `${file.name} foi enviado.` });
      }
    }

    setIsUploading(false);
    setFiles([]);
    setDescription('');
    onUploadSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] modal-dark-theme">
        <DialogHeader>
          <DialogTitle className="dialog-title-custom">Anexar Novo Documento</DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Faça o upload de exames, laudos ou outros documentos importantes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div
            {...getRootProps()}
            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-violet-400/50 hover:border-violet-400'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-violet-300" />
            {isDragActive ? (
              <p className="mt-2 text-violet-300">Solte os arquivos aqui...</p>
            ) : (
              <p className="mt-2 text-violet-300/80">Arraste e solte os arquivos aqui, ou clique para selecionar</p>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium label-custom">Arquivos Selecionados:</h4>
              <ul className="space-y-2">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center justify-between p-2 bg-black/20 rounded-md">
                    <div className="flex items-center gap-2">
                      <File className="h-5 w-5 text-violet-400" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(file)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <Label htmlFor="description" className="label-custom">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Hemograma completo de 01/01/2024"
              className="textarea-light-theme"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>Cancelar</Button>
          <Button onClick={handleUpload} disabled={isUploading || files.length === 0} className="btn-frutacor">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentModal;