import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SurgeryCalendarModal from '@/components/surgeries/SurgeryCalendarModal'; // Para edição
import GeneratePreOpDocsModal from '@/components/surgeries/GeneratePreOpDocsModal'; // Para documentos
import SurgeryPlanningModal from '@/components/surgeries/SurgeryPlanningModal'; // Para planejamento
import { useSurgeries } from '@/hooks/useSurgeries'; // Para refetch após ações
import { useToast } from '@/components/ui/use-toast';

const SurgeryListTable = ({ surgeries }) => {
  const { refetchAll, deleteSurgery } = useSurgeries();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState(null);

  if (!surgeries || surgeries.length === 0) {
    return <div className="text-center py-10"><p className="text-xl text-violet-300">Nenhuma cirurgia agendada encontrada.</p></div>;
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Realizada': return 'success';
      case 'Confirmada': return 'default';
      case 'Cancelada': return 'destructive';
      case 'Pendente': return 'outline';
      case 'Agendada': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleOpenModal = (type, surgery) => {
    setSelectedSurgery(surgery);
    if (type === 'edit') {
      setIsEditModalOpen(true);
    } else if (type === 'docs') {
      setIsDocsModalOpen(true);
    } else if (type === 'planning') {
      setIsPlanningModalOpen(true);
    }
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsDocsModalOpen(false);
    setIsPlanningModalOpen(false);
    setSelectedSurgery(null);
    refetchAll(); // Recarrega os dados após qualquer ação nos modais
  };

  const handleDeleteSurgery = async (surgeryId) => {
    if (window.confirm("Tem certeza que deseja excluir esta cirurgia?")) {
      const { success, error } = await deleteSurgery(surgeryId);
      if (success) {
        toast({ title: "Cirurgia excluída", description: "A cirurgia foi removida com sucesso.", variant: "success" });
        refetchAll();
      } else {
        toast({ title: "Erro ao excluir", description: error, variant: "destructive" });
      }
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead>Procedimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surgeries.map(surgery => (
            <TableRow key={surgery.id} className="hover:bg-white/5">
              <TableCell className="font-medium">
                {surgery.scheduled_date_time ? new Date(surgery.scheduled_date_time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
              </TableCell>
              <TableCell>{surgery.patient_name || 'N/A'}</TableCell>
              <TableCell>{surgery.professional_name || 'N/A'}</TableCell>
              <TableCell>{surgery.surgery_type || surgery.custom_surgery_name || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(surgery.status)}>{surgery.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenModal('edit', surgery)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenModal('planning', surgery)}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Planejar Cirurgia
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenModal('docs', surgery)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar Documentos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteSurgery(surgery.id)}>
                      <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                      <span className="text-red-500">Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isEditModalOpen && selectedSurgery && (
        <SurgeryCalendarModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          event={{ // Formatar para o modal de calendário que espera um formato de evento
            event_id: selectedSurgery.id,
            patient_id: selectedSurgery.patient_id,
            professional_id: selectedSurgery.professional_id,
            start: selectedSurgery.scheduled_date_time,
            title: selectedSurgery.surgery_type || selectedSurgery.custom_surgery_name,
            status: selectedSurgery.status,
            notes: selectedSurgery.notes,
            resource: {
              duration_minutes: selectedSurgery.duration_minutes,
              hospital_name: selectedSurgery.hospital_name,
              room_number: selectedSurgery.room_number,
              financial_status: selectedSurgery.financial_status,
              surgery_type_id: selectedSurgery.surgery_type_id,
              custom_surgery_name: selectedSurgery.custom_surgery_name,
            }
          }}
          onSaveSuccess={handleCloseModals}
          onDeleteSuccess={handleCloseModals}
        />
      )}

      {isDocsModalOpen && selectedSurgery && (
        <GeneratePreOpDocsModal
          isOpen={isDocsModalOpen}
          onClose={handleCloseModals}
          surgeryDetails={selectedSurgery}
          onDocumentsGenerated={handleCloseModals}
        />
      )}

      {isPlanningModalOpen && selectedSurgery && (
        <SurgeryPlanningModal
          isOpen={isPlanningModalOpen}
          onClose={handleCloseModals}
          surgery={selectedSurgery}
          onSave={handleCloseModals}
        />
      )}
    </div>
  );
};

export default SurgeryListTable;