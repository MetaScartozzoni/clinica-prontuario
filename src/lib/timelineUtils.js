import { Calendar, Stethoscope, FileText, MessageSquare as BotMessageSquare, Receipt, MessageSquare, Briefcase, ClipboardCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const getTimelineIcon = (eventType) => {
  const iconMap = {
    appointment: Calendar,
    consultation: Stethoscope,
    document: FileText,
    communication: BotMessageSquare,
    quote: Receipt,
    patient_note: MessageSquare,
    surgery: Briefcase,
    evaluation: ClipboardCheck,
  };
  return iconMap[eventType] || Stethoscope;
};

export const getTimelineColor = (eventType) => {
  const colorMap = {
    appointment: 'bg-blue-500',
    consultation: 'bg-green-500',
    document: 'bg-yellow-500',
    communication: 'bg-purple-500',
    quote: 'bg-orange-500',
    patient_note: 'bg-pink-500',
    surgery: 'bg-red-500',
    evaluation: 'bg-teal-500',
  };
  return colorMap[eventType] || 'bg-gray-500';
};

export const getTimelineTitle = (eventType) => {
  const titleMap = {
    appointment: 'Agendamento de Consulta',
    consultation: 'Atendimento Rápido',
    document: 'Documento Adicionado',
    communication: 'Comunicação Automática',
    quote: 'Orçamento Criado/Atualizado',
    patient_note: 'Nota Interna Adicionada',
    surgery: 'Cirurgia Agendada',
    evaluation: 'Ficha de Avaliação Completa',
  };
  return titleMap[eventType] || 'Evento';
};

export const formatTimelineDate = (timestamp) => {
  if (!timestamp) return 'Data desconhecida';
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
    return format(date, "d 'de' MMMM 'de' yyyy, 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Data inválida';
  }
};

export const formatCurrency = (value) => {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue);
};