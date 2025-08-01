import React from 'react';
import NegotiationCard from '@/components/negotiations/NegotiationCard.jsx';
import { MessageSquare, Loader2 } from 'lucide-react';

const NegotiationList = ({ negotiations, isLoading, onOpenChat, onEdit }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (negotiations.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <MessageSquare className="mx-auto h-12 w-12" />
        <p className="mt-4 text-lg">Nenhuma negociação encontrada com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {negotiations.map(neg => (
        <NegotiationCard key={neg.id} negotiation={neg} onOpenChat={onOpenChat} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default NegotiationList;