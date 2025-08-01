import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit, Save, Video, ExternalLink, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const LOCAL_STORAGE_KEY_WHEREBY = 'wherebyRooms';

const TelemedicineSettings = () => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomUrl, setNewRoomUrl] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditName, setCurrentEditName] = useState('');
  const [currentEditUrl, setCurrentEditUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    try {
      const storedRooms = localStorage.getItem(LOCAL_STORAGE_KEY_WHEREBY);
      if (storedRooms) setRooms(JSON.parse(storedRooms));
      const storedApiKey = localStorage.getItem('wherebyApiKey');
      if (storedApiKey) setApiKey(storedApiKey);
    } catch (error) {
      console.error("Failed to parse Whereby settings from localStorage", error);
      setRooms([]);
    }
  }, []);

  const saveRoomsToLocalStorage = (updatedRooms) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_WHEREBY, JSON.stringify(updatedRooms));
  };
  
  const handleAddRoom = () => {
    if (newRoomName.trim() === '' || newRoomUrl.trim() === '') {
      toast({ title: "Erro", description: "Nome e URL da sala são obrigatórios.", variant: "destructive" });
      return;
    }
    const newId = `whereby_${Date.now()}`;
    const updatedRooms = [...rooms, { id: newId, name: newRoomName.trim(), url: newRoomUrl.trim() }];
    setRooms(updatedRooms);
    saveRoomsToLocalStorage(updatedRooms);
    setNewRoomName('');
    setNewRoomUrl('');
    toast({ title: "Sala Adicionada", description: `Sala "${newRoomName.trim()}" adicionada com sucesso.` });
  };

  const handleDeleteRoom = (roomId) => {
    const roomToDelete = rooms.find(c => c.id === roomId);
    const updatedRooms = rooms.filter(c => c.id !== roomId);
    setRooms(updatedRooms);
    saveRoomsToLocalStorage(updatedRooms);
    toast({ title: "Sala Removida", description: `Sala "${roomToDelete?.name}" removida.`, variant: "destructive" });
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setCurrentEditName(room.name);
    setCurrentEditUrl(room.url);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (currentEditName.trim() === '' || currentEditUrl.trim() === '') {
      toast({ title: "Erro", description: "Nome e URL da sala são obrigatórios.", variant: "destructive" });
      return;
    }
    const updatedRooms = rooms.map(c => 
      c.id === editingRoom.id 
      ? { ...c, name: currentEditName.trim(), url: currentEditUrl.trim() } 
      : c
    );
    setRooms(updatedRooms);
    saveRoomsToLocalStorage(updatedRooms);
    setEditModalOpen(false);
    setEditingRoom(null);
    toast({ title: "Sala Atualizada", description: `Sala "${currentEditName.trim()}" atualizada com sucesso.` });
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('wherebyApiKey', apiKey);
    toast({
      title: 'API Key Salva!',
      description: 'Sua chave de API do Whereby foi salva localmente.',
    });
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary"/>
            Configurações de Telemedicina (Whereby)
          </CardTitle>
          <CardDescription>
            Gerencie as salas de reunião do Whereby para teleconsultas. As salas cadastradas aqui podem ser usadas nos agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-grow w-full sm:w-auto">
              <Label htmlFor="new-room-name">Nome da Sala</Label>
              <Input 
                id="new-room-name" 
                value={newRoomName} 
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Ex: Sala de Consulta 1"
              />
            </div>
            <div className="flex-grow w-full sm:w-auto">
              <Label htmlFor="new-room-url">URL da Sala</Label>
              <Input 
                id="new-room-url" 
                value={newRoomUrl} 
                onChange={(e) => setNewRoomUrl(e.target.value)}
                placeholder="https://clinica.whereby.com/exemplo"
              />
            </div>
            <Button onClick={handleAddRoom} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Sala</Button>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-muted-foreground">Salas Cadastradas:</h3>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                  <a href={room.url} target="_blank" rel="noopener noreferrer" className="flex items-center flex-grow truncate pr-2 hover:text-primary">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="flex-grow truncate" title={room.name}>{room.name}</span>
                  </a>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(room)} className="text-blue-500 hover:bg-blue-500/10">
                      <Edit className="h-4 w-4"/>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRoom(room.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma sala do Whereby cadastrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Key className="h-6 w-6" />
            Automação Futura: Integração com API
          </CardTitle>
          <CardDescription className="text-amber-800">
            Para criar salas de reunião automaticamente para cada teleconsulta, insira sua API Key do Whereby abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
             <div className="flex-grow w-full">
                <Label htmlFor="whereby-api-key">Whereby API Key</Label>
                <Input
                  id="whereby-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Insira sua API Key aqui"
                />
             </div>
             <Button onClick={handleSaveApiKey} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">
               <Save className="mr-2 h-4 w-4" />
               Salvar Chave
             </Button>
          </div>
          <p className="text-xs text-amber-700 mt-2">
            Sua chave será salva apenas no armazenamento local do seu navegador para sua segurança. A funcionalidade de criação automática de salas será implementada em uma próxima etapa.
          </p>
        </CardContent>
      </Card>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Sala do Whereby</DialogTitle>
            <DialogDescription>
              Altere os detalhes da sala "{editingRoom?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="edit-room-name">Novo Nome</Label>
              <Input 
                id="edit-room-name" 
                value={currentEditName} 
                onChange={(e) => setCurrentEditName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-room-url">Nova URL</Label>
              <Input 
                id="edit-room-url" 
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

export default TelemedicineSettings;