import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { GanttChartSquare, Loader2 } from 'lucide-react';
import { useQuotesPipeline } from '@/hooks/useQuotesPipeline';
import PipelineColumn from '@/components/sales-pipeline/PipelineColumn';

const SalesPipelinePage = () => {
  const { quotesByStatus, isLoading, updateQuoteStatusInPipeline } = useQuotesPipeline();

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const sourceColumn = active.data.current?.sortable.containerId;
    const destColumn = over.data.current?.sortable?.containerId || over.id;

    if (sourceColumn && destColumn && sourceColumn !== destColumn) {
      updateQuoteStatusInPipeline(active.id, sourceColumn, destColumn);
    }
  };

  const columnOrder = ['Enviado', 'Visualizado', 'Em Negociação', 'Aceito', 'Pago', 'Recusado'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6"
    >
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center text-white">
          <GanttChartSquare className="mr-3 h-8 w-8 text-violet-400" />
          Pipeline de Vendas (Kanban)
        </h1>
        <p className="text-violet-200">
          Arraste e solte os orçamentos para atualizar o status no funil de vendas.
        </p>
      </header>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-violet-400" />
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 overflow-x-auto pb-4">
            {columnOrder.map(status => (
              <PipelineColumn
                key={status}
                id={status}
                title={status}
                quotes={quotesByStatus[status] || []}
              />
            ))}
          </div>
        </DndContext>
      )}
    </motion.div>
  );
};

export default SalesPipelinePage;