import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { getTimelineIcon, getTimelineColor, getTimelineTitle, formatTimelineDate, formatCurrency } from '@/lib/timelineUtils';

const TimelineItem = ({ item }) => {
  const Icon = getTimelineIcon(item.event_type);
  const color = getTimelineColor(item.event_type);
  const title = getTimelineTitle(item.event_type);

  const renderDetails = () => {
    switch (item.event_type) {
      case 'appointment':
        return `Agendado com ${item.professional_name || 'Profissional'}. Status: ${item.status || 'N/A'}.`;
      case 'surgery':
        return `Procedimento: ${item.details || 'Não especificado'}. Status: ${item.status || 'N/A'}.`;
      case 'quote':
        return (
          <div>
            <p>Procedimento: {item.details || 'Não especificado'}.</p>
            <p className="font-semibold">Valor: {formatCurrency(item.amount)}</p>
            <p>Status: <Badge variant={item.status === 'Aceito' ? 'success' : 'default'}>{item.status || 'N/A'}</Badge></p>
          </div>
        );
      case 'document':
        return `Documento: "${item.details || 'Não especificado'}" foi carregado.`;
      case 'patient_note':
        return `Nota de ${item.professional_name || 'Equipe'}: "${item.details || ''}"`;
      case 'evaluation':
        return `Avaliação realizada por ${item.professional_name || 'Profissional'}. Queixa: "${item.details || 'Não especificada'}".`;
      case 'consultation':
        return `Atendimento Rápido por ${item.professional_name || 'Profissional'}. Queixa: "${item.details || 'Não especificada'}".`;
      default:
        return item.details || 'Nenhum detalhe adicional.';
    }
  };
  
  return (
    <motion.div
      className="relative pl-8"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`absolute left-0 top-1.5 h-4 w-4 rounded-full ${color} z-10 ring-4 ring-background`}>
        <div className="flex items-center justify-center h-full">
          <Icon className="h-3 w-3 text-white/90" />
        </div>
      </div>
      <div className="ml-4">
        <div className="flex items-baseline justify-between">
          <p className="font-bold text-violet-100">{title}</p>
          <time className="text-xs text-violet-300">{formatTimelineDate(item.event_timestamp)}</time>
        </div>
        <div className="p-3 mt-1 rounded-md bg-black/20 text-sm text-violet-200">
          {renderDetails()}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineItem;