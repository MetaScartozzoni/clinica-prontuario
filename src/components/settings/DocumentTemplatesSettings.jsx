import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

const LOCAL_STORAGE_KEY = 'documentTemplates';

const initialTemplates = [
  { id: 'DT001', name: 'Termo de Consentimento - Rinoplastia' },
  { id: 'DT002', name: 'Atestado Pós-Operatório Geral' },
  { id: 'DT003', name: 'Orientações Pré-Operatórias - Lipoaspiração' },
];

const DocumentTemplatesSettings = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(() => {
    const storedTemplates = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedTemplates ? JSON.parse(storedTemplates) : initialTemplates;
  });
  const [newTemplateName, setNewTemplateName] = useState('');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditName, setCurrentEditName] = useState('');

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const handleAddTemplate = () => {
    if (newTemplateName.trim() === '') {
      toast({ title: "Erro", description: "Nome do template não pode ser vazio.", variant: "destructive" });
      return;
    }
    const newId = `DT${String(Date.now()).slice(-5)}`; // Simple unique ID
    setTemplates([...templates, { id: newId, name: newTemplateName.trim() }]);
    setNewTemplateName('');
    toast({ title: "Template Adicionado", description: `Template "${newTemplateName.trim()}" adicionado.` });
  };

  const handleDeleteTemplate = (templateId) => {
    const templateToDelete = templates.find(t => t.id === templateId);
    setTemplates(templates.filter(t => t.id !== templateId));
    toast({ title: "Template Removido", description: `Template "${templateToDelete?.name}" removido.`, variant: "destructive" });
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setCurrentEditName(template.name);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (currentEditName.trim() === '') {
      toast({ title: "Erro", description: "Nome do template não pode ser vazio.", variant: "destructive" });
      return;
    }
    setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, name: currentEditName.trim() } : t));
    setEditModalOpen(false);
    setEditingTemplate(null);
    toast({ title: "Template Atualizado", description: `Template "${currentEditName.trim()}" atualizado.` });
  };
  
  const handleSaveChanges = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
    toast({ title: "Configurações Salvas", description: "Os templates de documentos foram salvos no localStorage." });
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Gerenciar Templates de Documentos</CardTitle>
        <CardDescription>Adicione, edite e remova os nomes dos seus templates de documentos. O conteúdo real do template não é gerenciado aqui.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-2 items-end">
          <div className="flex-grow w-full sm:w-auto">
            <Label htmlFor="new-template-name">Nome do Novo Template</Label>
            <Input 
              id="new-template-name" 
              value={newTemplateName} 
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Ex: Termo de Consentimento - Geral"
            />
          </div>
          <Button onClick={handleAddTemplate} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4"/>Adicionar</Button>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-muted-foreground">Templates Existentes:</h3>
          {templates.length > 0 ? (
            templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="flex-grow truncate pr-2" title={template.name}>{template.name} <span className="text-xs text-muted-foreground">({template.id})</span></span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(template)} className="text-blue-500 hover:bg-blue-500/10">
                    <Edit className="h-4 w-4"/>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhum template cadastrado.</p>
          )}
        </div>
        <Button onClick={handleSaveChanges} className="w-full md:w-auto bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white">
          <Save className="mr-2 h-4 w-4" /> Salvar Templates no LocalStorage
        </Button>
      </CardContent>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nome do Template</DialogTitle>
            <DialogDescription>
              Altere o nome do template "{editingTemplate?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-template-name">Novo Nome</Label>
            <Input 
              id="edit-template-name" 
              value={currentEditName} 
              onChange={(e) => setCurrentEditName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DocumentTemplatesSettings;