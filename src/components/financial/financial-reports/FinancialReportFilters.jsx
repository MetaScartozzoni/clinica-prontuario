import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const FinancialReportFilters = ({ selectedMonth, setSelectedMonth, availableMonths, onExport, isLoading, hasReportData }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
      <div>
        <Label htmlFor="reportMonth" className="text-sm font-medium text-card-foreground/90">Mês do Relatório</Label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={availableMonths.length === 0 || isLoading}>
          <SelectTrigger id="reportMonth" className="w-full sm:w-[200px] input-light-theme mt-1">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.length > 0 ? availableMonths.map(month => (
              <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
            )) : <SelectItem value="" disabled>Nenhum mês disponível</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onExport} variant="outline" size="sm" disabled={!hasReportData || isLoading}>
        <Download className="mr-2 h-4 w-4" /> Exportar (Em breve)
      </Button>
    </div>
  );
};

export default FinancialReportFilters;