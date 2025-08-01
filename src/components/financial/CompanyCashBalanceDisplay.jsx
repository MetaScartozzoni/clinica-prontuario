import React from 'react';

const CompanyCashBalanceDisplay = ({ balance }) => {
  return (
    <div className="bg-primary/10 p-6 rounded-lg mb-6 text-center">
      <p className="text-sm font-medium text-primary/80">SALDO ATUAL NO CAIXA DA EMPRESA</p>
      <p className="text-4xl font-bold text-primary">
        R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default CompanyCashBalanceDisplay;