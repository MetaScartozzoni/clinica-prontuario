import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const QuoteSurgeryDetailsForm = ({ formData, onFormChange, onSurgeryTypeChange, surgeryTypes }) => {
  return (
    <div className="space-y-3 p-3 border rounded-md bg-black/20">
      <h4 className="text-lg font-semibold text-primary">Detalhes da Cirurgia</h4>
      <div>
        <Label htmlFor="surgery_type_id" className="label-custom">Tipo de Cirurgia (Base)</Label>
        <Select onValueChange={onSurgeryTypeChange} value={formData.surgery_type_id}>
          <SelectTrigger id="surgery_type_id" className="select-trigger-custom"><SelectValue placeholder="Selecione o tipo de cirurgia base" /></SelectTrigger>
          <SelectContent className="select-content-custom">
            {surgeryTypes.map(st => <SelectItem key={st.id} value={st.id} className="select-item-custom">{st.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {formData.surgery_type_id && (
        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2 mt-2">
          <p className="text-violet-300">Custo Base Clínica: <span className="text-white">{formatCurrency(formData.clinic_base_cost)}</span></p>
          <p className="text-violet-300">Custo Base Hospital: <span className="text-white">{formatCurrency(formData.hospital_base_cost)}</span></p>
        </div>
      )}
      <div>
        <Label htmlFor="custom_surgery_name" className="label-custom">Nome da Cirurgia (para o paciente)</Label>
        <Input 
          id="custom_surgery_name" 
          name="custom_surgery_name" 
          value={formData.custom_surgery_name} 
          onChange={(e) => onFormChange(e.target.name, e.target.value)} 
          placeholder="Ex: Lipoaspiração Abdominal com Mastopexia" 
          required 
          className="input-light-theme"
        />
      </div>
    </div>
  );
};

export default QuoteSurgeryDetailsForm;