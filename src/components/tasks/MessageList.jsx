import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MessageList = ({ messages }) => {
  if (!messages || messages.length === 0) {
    return <p className="text-center text-violet-300 py-10">Nenhuma mensagem encontrada.</p>;
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {messages.map(message => (
        <Card key={message.id} className="bg-black/20 border border-white/10 hover:bg-black/30 transition-colors">
          <CardContent className="p-4 flex items-start gap-4">
            <Avatar>
              <AvatarImage src={message.sender?.avatar_url} />
              <AvatarFallback>{getInitials(message.sender?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex justify-between items-baseline">
                <p className="font-semibold">{message.sender?.full_name}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              <p className="font-medium text-violet-300">{message.subject}</p>
              <p className="text-sm text-gray-400 mt-1">{message.content}</p>
            </div>
            {!message.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 self-center animate-pulse"></div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MessageList;