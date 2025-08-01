import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useNotification as useNotificationManager } from '@/contexts/NotificationContext';

const NotificationList = ({ notifications }) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotificationManager();

  if (!notifications || notifications.length === 0) {
    return <p className="text-center text-violet-300 py-10">Nenhuma notificação encontrada.</p>;
  }

  const getIcon = (type) => {
    switch (type) {
      case 'user_approval': return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'surgery_update': return <Info className="h-5 w-5 text-blue-400" />;
      case 'task_assignment': return <CheckCircle className="h-5 w-5 text-green-400" />;
      default: return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleClick = (notification) => {
    markAsRead(notification.id);
    if (notification.action_link) {
      navigate(notification.action_link);
    }
  };

  return (
    <div className="space-y-3">
      {notifications.map(notification => (
        <Card
          key={notification.id}
          onClick={() => handleClick(notification)}
          className={`bg-black/20 border border-white/10 cursor-pointer transition-all ${
            notification.status === 'unread' ? 'border-violet-500 hover:bg-violet-900/30' : 'hover:bg-black/30'
          }`}
        >
          <CardContent className="p-4 flex items-start gap-4">
            {getIcon(notification.type)}
            <div className="flex-grow">
              <p className="font-semibold">{notification.title}</p>
              <p className="text-sm text-gray-400 mt-1">{notification.content}</p>
            </div>
            <div className="text-xs text-gray-500 self-start">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NotificationList;