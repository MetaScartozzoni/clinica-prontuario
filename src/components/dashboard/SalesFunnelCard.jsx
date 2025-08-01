import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, Loader2 } from 'lucide-react';
import SalesFunnelChart from '@/components/dashboard/SalesFunnelChart';

const SalesFunnelCard = ({ funnelData, isLoading }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center"><Filter className="mr-2 h-6 w-6 text-indigo-400" /> Funil de Vendas</CardTitle>
          <Button variant="outline" size="sm">Ver Relatório Detalhado</Button>
        </div>
        <CardDescription>Acompanhe seus leads através das etapas de conversão. {isLoading ? "(Carregando...)" : ""}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <SalesFunnelChart data={funnelData} />
        )}
      </CardContent>
    </Card>
  );
};
SalesFunnelCard.defaultProps = {
  isLoading: false,
};


export default SalesFunnelCard;