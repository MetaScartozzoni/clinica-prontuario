import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';

const QuoteCard = ({ quote }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: quote.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };
  
  const patientName = quote.patients?.name || quote.patient_name;
  const surgeryName = quote.custom_surgery_name || quote.surgery_name;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold truncate text-primary">{patientName}</CardTitle>
            <div {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-gray-600">
              <GripVertical size={16} />
            </div>
          </div>
          <CardDescription className="text-xs truncate">{surgeryName}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm font-bold text-green-600">
            {quote.total_value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Criado em: {new Date(quote.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuoteCard;