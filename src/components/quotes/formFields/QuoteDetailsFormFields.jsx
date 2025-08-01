import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const QuoteDetailsFormFields = ({ formData, onFormChange, leadClassifications }) => {
  const handleInputChange = (e) => {
    onFormChange(e.target.name, e.target.value);
  };

  const handleSelectChange = (name, value) => {
    onFormChange(name, value);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-md font-medium text-violet-200">Detalhes do Orçamento</h4>
      <div>
        <Label htmlFor="add_quote_budget_date" className="label-custom">Data do Orçamento</Label>
        <Input id="add_quote_budget_date" name="budget_date" type="date" value={formData.budget_date} onChange={handleInputChange} className="input-light-theme"/>
      </div>
      <div>
        <Label htmlFor="add_quote_total_value" className="label-custom">Valor Total (R$)</Label>
        <Input id="add_quote_total_value" name="total_value" type="number" step="0.01" value={formData.total_value} onChange={handleInputChange} className="input-light-theme"/>
      </div>
      <div>
        <Label htmlFor="add_quote_status" className="label-custom">Status</Label>
        <Select onValueChange={(value) => handleSelectChange('status', value)} value={formData.status}>
          <SelectTrigger className="select-trigger-custom"><SelectValue /></SelectTrigger>
          <SelectContent className="select-content-custom">
            <SelectItem value="Pendente" className="select-item-custom">Pendente</SelectItem>
            <SelectItem value="Aceito" className="select-item-custom">Aceito</SelectItem>
            <SelectItem value="Recusado" className="select-item-custom">Recusado</SelectItem>
            <SelectItem value="Em Negociação" className="select-item-custom">Em Negociação</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {leadClassifications && Array.isArray(leadClassifications) && leadClassifications.length > 0 && (
        <div>
          <Label htmlFor="add_quote_lead_classification" className="label-custom">Classificação do Lead (Opcional)</Label>
          <Select onValueChange={(value) => handleSelectChange('lead_classification', value)} value={formData.lead_classification}>
            <SelectTrigger className="select-trigger-custom"><SelectValue placeholder="Selecione a classificação" /></SelectTrigger>
            <SelectContent className="select-content-custom">
              {leadClassifications.map(lc => <SelectItem key={lc} value={lc} className="select-item-custom">{lc}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="add_quote_observation" className="label-custom">Observações (Opcional)</Label>
        <Textarea id="add_quote_observation" name="observation" value={formData.observation} onChange={handleInputChange} className="textarea-light-theme"/>
      </div>
    </div>
  );
};

export default QuoteDetailsFormFields;