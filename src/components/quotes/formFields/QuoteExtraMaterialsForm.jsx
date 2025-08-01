import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit3 } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const QuoteExtraMaterialsForm = ({ 
  formData, 
  extraMaterials, 
  onExtraMaterialChange,
  editableExtraMaterialId,
  editableExtraMaterialCost,
  onEditExtraMaterialCost,
  onSaveEditableExtraMaterialCost,
  onCancelEditExtraMaterialCost,
  setEditableExtraMaterialCost
}) => {
  if (!extraMaterials || extraMaterials.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 p-3 border rounded-md bg-muted/20">
      <h4 className="text-lg font-semibold text-primary">Materiais e Serviços Extras (para Clínica)</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {extraMaterials.map(material => {
          const isSelected = (formData.selected_extra_materials || []).some(item => item.id === material.id);
          const selectedMaterialDetails = isSelected ? (formData.selected_extra_materials || []).find(item => item.id === material.id) : null;
          const isEditable = material.name && material.name.toLowerCase().includes('pós-operatório');

          return (
            <div key={material.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/30">
              <Checkbox
                id={`extra_mat_${material.id}`}
                checked={isSelected}
                onCheckedChange={(checked) => onExtraMaterialChange(material.id, checked)}
              />
              <Label htmlFor={`extra_mat_${material.id}`} className="flex-grow cursor-pointer">
                {material.name} ({formatCurrency(selectedMaterialDetails ? selectedMaterialDetails.cost : material.cost)})
                {material.description && <span className="block text-xs text-muted-foreground italic">{material.description}</span>}
              </Label>
              {isSelected && isEditable && editableExtraMaterialId !== material.id && (
                <Button type="button" variant="ghost" size="icon" onClick={() => onEditExtraMaterialCost(selectedMaterialDetails)} className="text-primary hover:text-primary/80">
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
        {editableExtraMaterialId && (
          <div className="mt-2 p-3 border rounded-md bg-background shadow-sm">
            <Label htmlFor="editable_extra_cost">Editar Custo de "{extraMaterials.find(m => m.id === editableExtraMaterialId)?.name}"</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input 
                id="editable_extra_cost"
                type="number"
                value={editableExtraMaterialCost}
                onChange={(e) => setEditableExtraMaterialCost(e.target.value)}
                placeholder="Novo Custo (R$)"
                className="flex-grow"
              />
              <Button type="button" onClick={onSaveEditableExtraMaterialCost} size="sm">Salvar Custo</Button>
              <Button type="button" variant="outline" size="sm" onClick={onCancelEditExtraMaterialCost}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteExtraMaterialsForm;