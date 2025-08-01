import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, File as FileIcon, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const UploadFileModal = ({ isOpen, onClose, onFileUpload, patientId }) => {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      // Limit file size to 10MB
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "Por favor, selecione um arquivo com menos de 10MB.",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  }, []);
  
  const clearFile = () => {
    setFile(null);
    const fileInput = document.getElementById('file-upload');
    if(fileInput) fileInput.value = '';
  }

  const handleSubmit = async () => {
    if (!file) {
      toast({ title: "Nenhum arquivo selecionado", description: "Por favor, selecione um arquivo para enviar.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    const success = await onFileUpload({ file, description });
    setIsSubmitting(false);

    if (success) {
      setFile(null);
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Arquivo</DialogTitle>
          <DialogDescription>Anexe exames, fotos ou outros documentos do paciente.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div 
            className="border-2 border-dashed border-violet-400 rounded-lg p-6 text-center cursor-pointer hover:bg-violet-500/10 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
            {file ? (
              <div className="flex flex-col items-center gap-2 text-white">
                <FileIcon className="h-10 w-10 text-green-400" />
                <span className="font-semibold">{file.name}</span>
                <span className="text-xs text-violet-300">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                 <Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation(); clearFile();}}>
                    <X className="mr-2 h-4 w-4"/>
                    Trocar arquivo
                 </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-violet-300">
                <UploadCloud className="h-10 w-10" />
                <p className="font-semibold">Arraste e solte o arquivo aqui</p>
                <p className="text-sm">ou clique para selecionar</p>
                <p className="text-xs mt-2">PDF, JPG, PNG (máx. 10MB)</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="file-description">Descrição (Opcional)</Label>
            <Textarea 
              id="file-description" 
              placeholder="Ex: Laudo de ressonância magnética de 01/01/2024" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !file}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enviar Arquivo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFileModal;