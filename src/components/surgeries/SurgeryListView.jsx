import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SurgeryListTable from './SurgeryListTable';
import { motion } from 'framer-motion';

const SurgeryListView = ({ surgeries, searchTerm, onSearchTermChange }) => {
  const [statusFilter, setStatusFilter] = useState('todos');

  const filteredSurgeries = surgeries.filter(surgery => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (surgery.patient_name && surgery.patient_name.toLowerCase().includes(term)) ||
      (surgery.professional_name && surgery.professional_name.toLowerCase().includes(term)) ||
      (surgery.surgery_type && surgery.surgery_type.toLowerCase().includes(term)) ||
      (surgery.custom_surgery_name && surgery.custom_surgery_name.toLowerCase().includes(term))
    );
    const matchesStatus = statusFilter === 'todos' || surgery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input handled by parent */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] select-trigger-custom">
            <SelectValue placeholder="Filtrar por status..." />
          </SelectTrigger>
          <SelectContent className="select-content-custom">
            <SelectItem value="todos" className="select-item-custom">Todos</SelectItem>
            <SelectItem value="Agendada" className="select-item-custom">Agendada</SelectItem>
            <SelectItem value="Confirmada" className="select-item-custom">Confirmada</SelectItem>
            <SelectItem value="Realizada" className="select-item-custom">Realizada</SelectItem>
            <SelectItem value="Cancelada" className="select-item-custom">Cancelada</SelectItem>
            <SelectItem value="Pendente" className="select-item-custom">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SurgeryListTable surgeries={filteredSurgeries} />
    </motion.div>
  );
};

export default SurgeryListView;