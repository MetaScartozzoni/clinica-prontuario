import React from 'react';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

const StatusBadge = ({ status }) => {
  let icon, colorClass, textClass;
  switch (status) {
    case 'Aceito':
      icon = <CheckCircle className="h-4 w-4 mr-1.5" />;
      colorClass = 'bg-green-100 dark:bg-green-900/30';
      textClass = 'text-green-700 dark:text-green-300';
      break;
    case 'Recusado':
      icon = <XCircle className="h-4 w-4 mr-1.5" />;
      colorClass = 'bg-red-100 dark:bg-red-900/30';
      textClass = 'text-red-700 dark:text-red-300';
      break;
    case 'Em Negociação':
      icon = <DollarSign className="h-4 w-4 mr-1.5" />; 
      colorClass = 'bg-blue-100 dark:bg-blue-900/30';
      textClass = 'text-blue-700 dark:text-blue-300';
      break;
    default: // Pendente
      icon = <Clock className="h-4 w-4 mr-1.5" />;
      colorClass = 'bg-yellow-100 dark:bg-yellow-900/30';
      textClass = 'text-yellow-700 dark:text-yellow-300';
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass} ${textClass}`}>
      {icon}
      {status}
    </span>
  );
};

export default StatusBadge;