import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit2, MessageSquare } from 'lucide-react';

const NegotiationCard = ({ negotiation, onOpenChat, onEdit }) => {
  const patientName = negotiation.patients?.name || negotiation.patient_name || 'N/A';
  const surgeryName = negotiation.surgery_types?.name || negotiation.surgery_name || 'N/A';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-[hsl(var(--border))] rounded-lg shadow-lg p-4 space-y-3 hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-primary">{patientName}</h3>
          <p className="text-sm text-muted-foreground">Orçamento ID: {negotiation.id.substring(0,8)}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium
          ${negotiation.status === 'Em Negociação' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
            negotiation.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
            negotiation.status === 'Aceito' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
          {negotiation.status}
        </span>
      </div>
      <p className="text-sm"><span className="font-medium">Procedimento:</span> {surgeryName}</p>
      <p className="text-sm"><span className="font-medium">Valor:</span> {negotiation.total_value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(negotiation)} title="Editar Orçamento/Negociação">
          <Edit2 className="h-4 w-4 mr-1" /> Editar
        </Button>
        <Button variant="default" size="sm" onClick={() => onOpenChat(negotiation)} className="btn-frutacor">
          <MessageSquare className="h-4 w-4 mr-1" /> Chat
        </Button>
      </div>
    </motion.div>
  );
};

export default NegotiationCard;