import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import QuoteCard from '@/components/sales-pipeline/QuoteCard';
import { motion } from 'framer-motion';

const PipelineColumn = ({ id, title, quotes }) => {
  const { setNodeRef } = useDroppable({ id });

  const totalValue = quotes.reduce((sum, quote) => sum + (quote.total_value || 0), 0);

  const getHeaderColor = (status) => {
    switch (status) {
      case 'Enviado': return 'bg-blue-500';
      case 'Visualizado': return 'bg-yellow-500';
      case 'Em Negociação': return 'bg-orange-500';
      case 'Aceito': return 'bg-teal-500';
      case 'Pago': return 'bg-green-500';
      case 'Recusado': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      ref={setNodeRef}
      className="flex flex-col bg-slate-200/50 dark:bg-gray-800/60 rounded-xl min-h-[300px] w-full"
    >
      <header className={`p-3 rounded-t-xl text-white font-bold text-center ${getHeaderColor(title)}`}>
        {title} ({quotes.length})
        <div className="text-xs font-normal">
          {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
      </header>

      <SortableContext id={id} items={quotes.map(q => q.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-grow p-3 space-y-3 overflow-y-auto">
          {quotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
          {quotes.length === 0 && <p className="text-center text-sm text-gray-500 pt-10">Nenhum orçamento aqui.</p>}
        </div>
      </SortableContext>
    </motion.div>
  );
};

export default PipelineColumn;