import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck as ShieldLock, PlusCircle, MinusCircle } from 'lucide-react';

const CompanyCashHeader = ({ onOpenModal }) => {
  return (
    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <CardTitle className="card-title-custom flex items-center">
          <ShieldLock className="mr-2 h-6 w-6" /> Caixa da Empresa (Restrito)
        </CardTitle>
        <CardDescription className="text-card-foreground/80">
          Saldo consolidado e transferências internas.
        </CardDescription>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => onOpenModal('to_company_cash')} className="btn-frutacor">
          <PlusCircle className="mr-2 h-5 w-5" /> Transferir para Caixa
        </Button>
        <Button onClick={() => onOpenModal('from_company_cash')} variant="outline">
          <MinusCircle className="mr-2 h-5 w-5" /> Retirar do Caixa
        </Button>
      </div>
    </CardHeader>
  );
};

export default CompanyCashHeader;