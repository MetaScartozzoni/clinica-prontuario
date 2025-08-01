import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const QuoteAdditionalDetailsForm = ({ formData, onFormChange }) => {
  return (
    <div className="space-y-3 p-3 border rounded-md bg-muted/20">
      <h4 className="text-lg font-semibold text-primary">Detalhes Adicionais do Orçamento</h4>
      <div>
        <Label htmlFor="budget_date">Data do Orçamento</Label>
        <Input 
          id="budget_date" 
          name="budget_date" 
          type="date" 
          value={formData.budget_date} 
          onChange={(e) => onFormChange(e.target.name, e.target.value)} 
          required 
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select onValueChange={(value) => onFormChange('status', value)} value={formData.status}>
          <SelectTrigger id="status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Aceito">Aceito</SelectItem>
            <SelectItem value="Recusado">Recusado</SelectItem>
            <SelectItem value="Em Negociação">Em Negociação</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="observation">Observações (Opcional)</Label>
        <Textarea 
          id="observation" 
          name="observation" 
          value={formData.observation} 
          onChange={(e) => onFormChange(e.target.name, e.target.value)} 
          placeholder="Informações adicionais, condições especiais, etc." 
        />
      </div>
    </div>
  );
};

export default QuoteAdditionalDetailsForm;