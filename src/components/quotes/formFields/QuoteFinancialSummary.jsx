import React from 'react';
import { AlertTriangle } from 'lucide-react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const QuoteFinancialSummary = ({ formData }) => {
  return (
    <div className="space-y-4 p-4 border rounded-md bg-card shadow-sm">
      <h4 className="text-xl font-bold text-center text-primary border-b pb-2">Resumo Financeiro</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
        <div className="p-3 rounded-md bg-primary/10">
          <p className="font-semibold text-primary">Valor Total Clínica:</p>
          <p className="font-bold text-2xl">{formatCurrency(formData.total_value_clinic)}</p>
        </div>
        <div className="p-3 rounded-md bg-secondary/10">
          <p className="font-semibold text-secondary">Valor Total Hospital:</p>
          <p className="font-bold text-2xl">{formatCurrency(formData.total_value_hospital)}</p>
        </div>
      </div>
      <div className="mt-4 p-3 rounded-md bg-gradient-to-r from-primary/20 to-secondary/20 text-center">
        <p className="font-semibold text-foreground text-xl">Valor Total do Orçamento:</p>
        <p className="font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">{formatCurrency(formData.total_budget_value)}</p>
      </div>
      {!formData.surgery_type_id && (
        <div className="flex items-center text-sm text-amber-600 bg-amber-100 p-2 rounded-md">
          <AlertTriangle className="h-4 w-4 mr-2"/>
          <span>Selecione um Tipo de Cirurgia para calcular os valores.</span>
        </div>
      )}
    </div>
  );
};

export default QuoteFinancialSummary;