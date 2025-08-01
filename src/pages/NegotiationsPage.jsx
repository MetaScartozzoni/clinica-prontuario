import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Search, MessageSquare, Filter, PlusCircle } from 'lucide-react';
import NegotiationModal from '@/components/negotiations/NegotiationModal.jsx';
import { useNegotiations } from '@/hooks/useNegotiations.js';
import NegotiationList from '@/components/negotiations/NegotiationList.jsx';
import NegotiationChatModal from '@/components/negotiations/NegotiationChatModal.jsx';

const NegotiationsPage = () => {
  const { toast } = useToast();
  const {
    negotiations,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentUser,
    refreshNegotiations,
  } = useNegotiations('Em Negociação');

  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);
  const [negotiationToEdit, setNegotiationToEdit] = useState(null);

  const handleOpenChat = (negotiation) => {
    setSelectedNegotiation(negotiation);
    setIsChatModalOpen(true);
  };

  const handleEditNegotiation = (negotiation) => {
    setNegotiationToEdit({ budget: negotiation });
    setIsNegotiationModalOpen(true);
  };
  
  const handleNegotiationModalClose = () => {
    setIsNegotiationModalOpen(false);
    setNegotiationToEdit(null);
    refreshNegotiations();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="shadow-xl border-t-4 border-[hsl(var(--title-yellow-highlight-hsl))]">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="page-title-yellow flex items-center">
                <MessageSquare className="mr-3 h-8 w-8" /> Painel de Negociações
              </CardTitle>
              <CardDescription className="text-muted-foreground">Gerencie e acompanhe as negociações com os clientes.</CardDescription>
            </div>
             <Button onClick={() => toast({ title: "Ação não disponível", description: "Crie uma negociação a partir de um orçamento existente na página de Orçamentos."})} className="btn-highlight-hover">
              <PlusCircle className="mr-2 h-5 w-5" /> Nova Negociação
            </Button>
          </div>
          <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por ID, Nome do Cliente ou Telefone..."
                className="pl-10 w-full bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos Status</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                  <SelectItem value="Aceito">Aceito</SelectItem>
                  <SelectItem value="Recusado">Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <NegotiationList
            negotiations={negotiations}
            isLoading={isLoading}
            onOpenChat={handleOpenChat}
            onEdit={handleEditNegotiation}
          />
        </CardContent>
      </Card>

      {selectedNegotiation && currentUser && (
        <NegotiationChatModal 
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          negotiation={selectedNegotiation}
          currentUser={currentUser}
        />
      )}
      
      {isNegotiationModalOpen && (
        <NegotiationModal
          isOpen={isNegotiationModalOpen}
          onClose={handleNegotiationModalClose}
          onSave={handleNegotiationModalClose}
          negotiationData={negotiationToEdit}
        />
      )}

    </motion.div>
  );
};

export default NegotiationsPage;