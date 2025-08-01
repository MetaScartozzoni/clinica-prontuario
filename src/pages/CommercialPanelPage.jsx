import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserPlus, FileText, Edit, Filter, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AddManualPatientModal from '@/components/patients/AddManualPatientModal.jsx';
import AddManualQuoteModal from '@/components/quotes/AddManualQuoteModal.jsx';

const leadStatusOptions = [
  "Novo", "Contatado", "Qualificado", "Proposta Enviada", 
  "Negociação", "Convertido", "Perdido", "Protocolo Gerado", "Aguardando Resposta"
];

const CommercialPanelPage = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingLead, setEditingLead] = useState(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [leadForModal, setLeadForModal] = useState(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('external_leads').select('*').order('received_at', { ascending: false });
      if (searchTerm) {
        query = query.or(`patient_name.ilike.%${searchTerm}%,patient_phone.ilike.%${searchTerm}%,procedure_of_interest.ilike.%${searchTerm}%`);
      }
      if (statusFilter && statusFilter !== "ALL") { 
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      toast({ title: "Erro ao buscar leads", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, searchTerm, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleUpdateLeadStatus = async (leadId, newStatus, newNotes = null) => {
    try {
      const updateData = { status: newStatus, updated_at: new Date().toISOString() };
      if (newNotes !== null && newNotes !== undefined) {
        updateData.internal_notes = newNotes;
      }
      const { error } = await supabase.from('external_leads').update(updateData).eq('id', leadId);
      if (error) throw error;
      toast({ title: "Status do Lead Atualizado!", variant: "success" });
      fetchLeads();
      setEditingLead(null);
    } catch (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    }
  };

  const openConvertToPatientModal = (lead) => {
    setLeadForModal(lead);
    setIsPatientModalOpen(true);
  };

  const openCreateQuoteModal = (lead) => {
    setLeadForModal(lead);
    setIsQuoteModalOpen(true);
  };
  
  const handlePatientAddedFromLead = () => {
    if (leadForModal) {
      handleUpdateLeadStatus(leadForModal.id, "Convertido", `${leadForModal.internal_notes || ''}\nPaciente cadastrado a partir deste lead.`);
    }
    setIsPatientModalOpen(false);
    setLeadForModal(null);
    fetchLeads(); 
  };

  const handleQuoteAddedFromLead = () => {
     if (leadForModal) {
      handleUpdateLeadStatus(leadForModal.id, "Proposta Enviada", `${leadForModal.internal_notes || ''}\nOrçamento gerado a partir deste lead.`);
    }
    setIsQuoteModalOpen(false);
    setLeadForModal(null);
    fetchLeads(); 
  };

  const handleEditLead = (lead) => {
    setEditingLead({ ...lead, newStatus: lead.status, newNotes: lead.internal_notes || '' });
  };

  const handleSaveEditLead = () => {
    if (editingLead) {
      handleUpdateLeadStatus(editingLead.id, editingLead.newStatus, editingLead.newNotes);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleStatusFilterChange = (value) => {
    if (value === "ALL") {
      setStatusFilter("");
    } else {
      setStatusFilter(value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8 space-y-6"
    >
      <Card className="card-glass">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-3xl">Painel Comercial - Leads Externos</CardTitle>
              <CardDescription>Gerencie os leads recebidos de formulários externos.</CardDescription>
            </div>
            <Button onClick={fetchLeads} variant="outline" disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Atualizar Leads
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border border-white/20 rounded-lg bg-black/20 space-y-4 md:space-y-0 md:flex md:items-end md:justify-between md:gap-4">
            <div className="flex-grow">
              <Label htmlFor="search-leads">Pesquisar Leads</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-violet-300" />
                <Input
                  id="search-leads"
                  type="text"
                  placeholder="Nome, telefone, procedimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-grow md:max-w-xs">
              <Label htmlFor="status-filter">Filtrar por Status</Label>
              <Select value={statusFilter || "ALL"} onValueChange={handleStatusFilterChange}>
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os Status</SelectItem>
                  {leadStatusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => { setSearchTerm(''); setStatusFilter(''); fetchLeads();}} variant="ghost">
              <Filter className="mr-2 h-4 w-4" /> Limpar Filtros
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-violet-400" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-violet-300">Nenhum lead encontrado com os filtros atuais.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-white/20">
                    <TableHead className="text-violet-200">Nome</TableHead>
                    <TableHead className="text-violet-200">Telefone</TableHead>
                    <TableHead className="text-violet-200">Interesse</TableHead>
                    <TableHead className="text-violet-200">Recebido Em</TableHead>
                    <TableHead className="text-violet-200">Status</TableHead>
                    <TableHead className="text-violet-200">Fonte</TableHead>
                    <TableHead className="text-right text-violet-200">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="border-b-white/10 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{lead.patient_name || 'N/A'}</TableCell>
                      <TableCell>{lead.patient_phone || 'N/A'}</TableCell>
                      <TableCell>{lead.procedure_of_interest || 'N/A'}</TableCell>
                      <TableCell>{formatDate(lead.received_at)}</TableCell>
                      <TableCell>
                        {editingLead?.id === lead.id ? (
                          <Select 
                            value={editingLead.newStatus} 
                            onValueChange={(value) => setEditingLead(prev => ({...prev, newStatus: value}))}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {leadStatusOptions.map(status => (
                                <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded-full text-white ${
                            lead.status === 'Convertido' ? 'bg-green-500/30' :
                            lead.status === 'Novo' ? 'bg-blue-500/30' :
                            lead.status === 'Proposta Enviada' ? 'bg-purple-500/30' :
                            lead.status === 'Perdido' ? 'bg-red-500/30' :
                            'bg-gray-500/30'
                          }`}>
                            {lead.status || 'N/A'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{lead.source_form_name || 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {editingLead?.id === lead.id ? (
                          <>
                            <Input 
                              type="text" 
                              placeholder="Notas internas..." 
                              value={editingLead.newNotes}
                              onChange={(e) => setEditingLead(prev => ({...prev, newNotes: e.target.value}))}
                              className="h-8 text-xs mb-1"
                            />
                            <Button onClick={handleSaveEditLead} size="sm" className="btn-gradient text-xs">Salvar</Button>
                            <Button onClick={() => setEditingLead(null)} size="sm" variant="ghost" className="text-xs">Cancelar</Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={() => openConvertToPatientModal(lead)} variant="outline" size="sm" className="text-xs">
                              <UserPlus className="mr-1 h-3 w-3" /> Cad. Paciente
                            </Button>
                            <Button onClick={() => openCreateQuoteModal(lead)} variant="outline" size="sm" className="text-xs">
                              <FileText className="mr-1 h-3 w-3" /> Gerar Orçam.
                            </Button>
                            <Button onClick={() => handleEditLead(lead)} variant="ghost" size="sm" className="text-xs">
                              <Edit className="mr-1 h-3 w-3" /> Editar
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {isPatientModalOpen && leadForModal && (
        <AddManualPatientModal
          isOpen={isPatientModalOpen}
          onClose={() => { setIsPatientModalOpen(false); setLeadForModal(null); }}
          onPatientAdded={handlePatientAddedFromLead}
          initialData={{
            first_name: leadForModal.patient_name?.split(' ')[0] || '',
            last_name: leadForModal.patient_name?.split(' ').slice(1).join(' ') || '',
            phone: leadForModal.patient_phone,
            email: leadForModal.patient_email,
            important_notes: `Lead de: ${leadForModal.source_form_name || 'Externo'}. Objetivo: ${leadForModal.patient_objective || 'N/A'}. Obs: ${leadForModal.observations || 'N/A'}`,
            lead_classification: 'Lead Quente (Alta Urgência)',
          }}
        />
      )}

      {isQuoteModalOpen && leadForModal && (
        <AddManualQuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => { setIsQuoteModalOpen(false); setLeadForModal(null); }}
          onQuoteAdded={handleQuoteAddedFromLead}
          initialData={{
            patient_name: leadForModal.patient_name,
            patient_phone: leadForModal.patient_phone,
            patient_email: leadForModal.patient_email,
            custom_surgery_name: leadForModal.procedure_of_interest,
            observation: `Lead de: ${leadForModal.source_form_name || 'Externo'}. Objetivo: ${leadForModal.patient_objective || 'N/A'}. Obs: ${leadForModal.observations || 'N/A'}`,
            lead_classification: 'Lead Quente (Alta Urgência)',
            status: 'Pendente',
          }}
        />
      )}

    </motion.div>
  );
};

export default CommercialPanelPage;