import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileText } from 'lucide-react';

const GeneratePreOpDocsModal = ({ isOpen, onClose, surgeryDetails, onDocumentsGenerated }) => {
  const { toast } = useToast();
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      const { data, error } = await supabase.from('surgery_document_templates').select('id, document_name, document_type').eq('is_active', true);
      
      if (error) {
        toast({ title: "Erro ao buscar modelos", description: error.message, variant: "destructive" });
        setAvailableTemplates([]);
      } else {
        setAvailableTemplates(data || []);
      }
      setIsLoadingTemplates(false);
    };

    if (isOpen) {
      fetchTemplates();
      setSelectedTemplates([]); 
    }
  }, [isOpen, toast]);

  const handleCheckboxChange = (templateId) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleGenerateDocuments = async () => {
    if (selectedTemplates.length === 0) {
      toast({ title: "Nenhum modelo selecionado", description: "Por favor, selecione ao menos um documento para gerar.", variant: "default" });
      return;
    }
    setIsGenerating(true);

    const generatedDocuments = [];
    const generationHistory = [];

    for (const templateId of selectedTemplates) {
      const template = availableTemplates.find(t => t.id === templateId);
      if (!template || !surgeryDetails?.patient_id) continue; 

      const fakeDocumentUrl = `https://example.com/docs/${surgeryDetails.patient_id}/${template.document_name.replace(/\s+/g, '_')}.pdf`;
      
      const docData = {
        patient_id: surgeryDetails.patient_id,
        surgery_schedule_id: surgeryDetails.id, // Adicionado para vincular ao agendamento
        document_template_id: template.id,
        document_name: template.document_name,
        document_type: template.document_type,
        generated_document_url: fakeDocumentUrl,
        status: 'Gerado',
      };

      const { data: newDoc, error } = await supabase
        .from('patient_surgery_documents')
        .insert(docData)
        .select()
        .single();

      if (error) {
        toast({ title: `Erro ao gerar ${template.document_name}`, description: error.message, variant: "destructive" });
      } else if (newDoc) {
        generatedDocuments.push(newDoc);
        // Ensure supabase.auth.user() is correctly accessed and its id is used
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("Error getting current user:", userError.message);
          // Decide how to handle this, e.g., use a default ID or skip `generated_by`
        }

        generationHistory.push({
          patient_surgery_document_id: newDoc.id,
          action_type: 'Gerado',
          notes: `Documento "${template.document_name}" gerado para a cirurgia de ${surgeryDetails.patient_name || 'paciente'} (ID: ${surgeryDetails.id})`,
          generation_date: new Date().toISOString(),
          generated_by: currentUser?.id // Pass the user ID or null if not available
        });
      }
    }

    if (generationHistory.length > 0) {
      const { error: historyError } = await supabase.from('document_generation_history').insert(generationHistory);
      if (historyError) {
        console.error("Erro ao salvar histórico de geração de documentos:", historyError.message);
        toast({ title: "Erro ao salvar histórico", description: historyError.message, variant: "destructive" });
      }
    }

    if (generatedDocuments.length > 0) {
      toast({ title: "Documentos Gerados", description: `${generatedDocuments.length} documento(s) foram gerados com sucesso.`, variant: "success" });
      if (onDocumentsGenerated) {
        onDocumentsGenerated(generatedDocuments);
      }
    }
    setIsGenerating(false);
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md modal-light-theme">
        <DialogHeader>
          <DialogTitle className="flex items-center dialog-title-custom">
            <FileText className="mr-2 h-6 w-6 text-primary" /> Gerar Documentos Pré-Operatórios
          </DialogTitle>
          <DialogDescription className="dialog-description-custom">
            Selecione os documentos para {surgeryDetails?.patient_name || 'o paciente'}.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingTemplates ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 label-custom">Carregando modelos...</p>
          </div>
        ) : availableTemplates.length > 0 ? (
          <div className="space-y-3 py-2 max-h-[50vh] overflow-y-auto pr-1">
            {availableTemplates.map(template => (
              <div key={template.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`template-${template.id}-gen-docs`}
                  checked={selectedTemplates.includes(template.id)}
                  onCheckedChange={() => handleCheckboxChange(template.id)}
                  className="checkbox-custom"
                />
                <Label htmlFor={`template-${template.id}-gen-docs`} className="flex-1 cursor-pointer label-custom">
                  {template.document_name} ({template.document_type})
                </Label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">Nenhum modelo de documento encontrado.</p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose} disabled={isGenerating}>Cancelar</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleGenerateDocuments} 
            disabled={isGenerating || isLoadingTemplates || selectedTemplates.length === 0}
            className="btn-frutacor"
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar Selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratePreOpDocsModal;