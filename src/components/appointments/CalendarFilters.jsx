import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CalendarFilters = ({ onFilterChange }) => {
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data, error } = await supabase.rpc('get_professionals_details');
      if (!error) {
        setProfessionals(data);
      }
    };
    fetchProfessionals();
  }, []);

  const handleProfessionalChange = (value) => {
    const professionalId = value === 'all' ? null : value;
    setSelectedProfessional(professionalId);
    onFilterChange({ professionalId: professionalId });
  };

  return (
    <div className="flex items-center gap-4">
      <Select onValueChange={handleProfessionalChange} value={selectedProfessional || 'all'}>
        <SelectTrigger className="w-[280px] bg-gray-800 border-gray-700 text-white">
          <SelectValue placeholder="Filtrar por profissional..." />
        </SelectTrigger>
        <SelectContent className="modal-dark-theme">
          <SelectItem value="all">Todos os Profissionais</SelectItem>
          {professionals.map((pro) => (
            <SelectItem key={pro.id} value={pro.id}>
              {pro.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CalendarFilters;