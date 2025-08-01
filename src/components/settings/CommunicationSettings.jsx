import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit, Save, AlertTriangle, Zap, MessageSquare, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

const LOCAL_STORAGE_KEY_TEAMS = 'teamsChannels';

const CommunicationSettings = () => {
  const { toast } = useToast();
  const [channels, setChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [editingChannel, setEditingChannel] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditName, setCurrentEditName] = useState('');
  const [currentEditUrl, setCurrentEditUrl] = useState('');

  useEffect(() => {
    try {
      const storedChannels = localStorage.getItem(LOCAL_STORAGE_KEY_TEAMS);
      if (storedChannels) {
        setChannels(JSON.parse(storedChannels));
      }
    } catch (error) {
      console.error("Failed to parse Teams channels from localStorage", error);
      setChannels([]);
    }
  }, []);

  const saveChannelsToLocalStorage = (updatedChannels) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TEAMS, JSON.stringify(updatedChannels));
  };
  
  const handleAddChannel = () => {
    if (newChannelName.trim() === '' || newChannelUrl.trim() === '') {
      toast({ title: "Erro", description: "Nome e URL do canal são obrigatórios.", variant: "destructive" });
      return;
    }
    const newId = `teams_${Date.now()}`;
    const updatedChannels = [...channels, { id: newId, name: newChannelName.trim(), url: newChannelUrl.trim() }];
    setChannels(updatedChannels);
    saveChannelsToLocalStorage(updatedChannels);
    setNewChannelName('');
    setNewChannelUrl('');
    toast({ title: "Canal Adicionado", description: `Canal "${newChannelName.trim()}" adicionado com sucesso.` });
  };

  const handleDeleteChannel = (channelId) => {
    const channelToDelete = channels.find(c => c.id === channelId);
    const updatedChannels = channels.filter(c => c.id !== channelId);
    setChannels(updatedChannels);
    saveChannelsToLocalStorage(updatedChannels);
    toast({ title: "Canal Removido", description: `Canal "${channelToDelete?.name}" removido.`, variant: "destructive" });
  };

  const openEditModal = (channel) => {
    setEditingChannel(channel);
    setCurrentEditName(channel.name);
    setCurrentEditUrl(channel.url);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (currentEditName.trim() === '' || currentEditUrl.trim() === '') {
      toast({ title: "Erro", description: "Nome e URL do canal são obrigatórios.", variant: "destructive" });
      return;
    }
    const updatedChannels = channels.map(c => 
      c.id === editingChannel.id 
      ? { ...c, name: currentEditName.trim(), url: currentEditUrl.trim() } 
      : c
    );
    setChannels(updatedChannels);
    saveChannelsToLocalStorage(updatedChannels);
    setEditModalOpen(false);
    setEditingChannel(null);
    toast({ title: "Canal Atualizado", description: `Canal "${currentEditName.trim()}" atualizado com sucesso.` });
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary"/>
            Canais de Comunicação (Microsoft Teams)
          </CardTitle>
          <CardDescription>
            Gerencie os links para os seus canais do Teams. Eles aparecerão em um menu de acesso rápido na barra lateral.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-grow w-full sm:w-auto">
              <Label htmlFor="new-channel-name">Nome do Canal</Label>
              <Input 
                id="new-channel-name" 
                value={newChannelName} 
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Ex: Orçamentos"
              />
            </div>
            <div className="flex-grow w-full sm:w-auto">
              <Label htmlFor="new-channel-url">URL do Canal</Label>
              <Input 
                id="new-channel-url" 
                value={newChannelUrl} 
                onChange={(e) => setNewChannelUrl(e.target.value)}
                placeholder="https://teams.microsoft.com/l/channel/..."
              />
            </div>
            <Button onClick={handleAddChannel} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Canal</Button>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-muted-foreground">Canais Cadastrados:</h3>
            {channels.length > 0 ? (
              channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                  <a href={channel.url} target="_blank" rel="noopener noreferrer" className="flex items-center flex-grow truncate pr-2 hover:text-primary">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="flex-grow truncate" title={channel.name}>{channel.name}</span>
                  </a>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(channel)} className="text-blue-500 hover:bg-blue-500/10">
                      <Edit className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteChannel(channel.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum canal do Teams cadastrado.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="h-6 w-6" />
            Próximo Passo: Alertas Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p>
            Quer receber notificações no Teams quando um evento importante acontecer no sistema (ex: "Novo orçamento para aprovar")?
            Isso é possível usando uma ferramenta de automação como <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="font-bold underline">Zapier</a> ou <a href="https://make.com" target="_blank" rel="noopener noreferrer" className="font-bold underline">Make.com</a>.
          </p>
          <p className="text-sm mt-2">
            O fluxo seria: **Evento no Supabase** → **Aciona o Zapier** → **Envia mensagem para o canal do Teams**.
          </p>
        </CardContent>
      </Card>


      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Canal do Teams</DialogTitle>
            <DialogDescription>
              Altere os detalhes do canal "{editingChannel?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="edit-channel-name">Novo Nome</Label>
              <Input 
                id="edit-channel-name" 
                value={currentEditName} 
                onChange={(e) => setCurrentEditName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-channel-url">Nova URL</Label>
              <Input 
                id="edit-channel-url" 
                value={currentEditUrl} 
                onChange={(e) => setCurrentEditUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationSettings;