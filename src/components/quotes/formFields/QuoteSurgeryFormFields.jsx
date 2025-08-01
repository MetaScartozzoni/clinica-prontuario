import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const QuoteSurgeryFormFields = ({ formData, onFormChange, surgeryTypes }) => {
  const handleInputChange = (e) => {
    onFormChange(e.target.name, e.target.value);
  };
  
  const handleSelectChange = (name, value) => {
    onFormChange(name, value);
  };

  return (
    <div className="space-y-3 border-b pb-4">
      <h4 className="text-md font-medium text-violet-200">Detalhes do Procedimento</h4>
      <div>
        <Label htmlFor="add_quote_surgery_type_id" className="label-custom">Tipo de Cirurgia (Base)</Label>
        <Select onValueChange={(value) => handleSelectChange('surgery_type_id', value)} value={formData.surgery_type_id}>
          <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
          <SelectContent className="select-content-custom">
            {surgeryTypes && surgeryTypes.map(st => <SelectItem key={st.id} value={st.id} className="select-item-custom">{st.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="add_quote_custom_surgery_name" className="label-custom">Nome da Cirurgia (Personalizado)</Label>
        <Input id="add_quote_custom_surgery_name" name="custom_surgery_name" value={formData.custom_surgery_name} onChange={handleInputChange} placeholder="Ex: Lipoaspiração Abdominal" className="input-light-theme"/>
      </div>
    </div>
  );
};

export default QuoteSurgeryFormFields;