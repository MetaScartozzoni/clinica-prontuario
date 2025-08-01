import React, { createContext, useContext, useState, useEffect } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    const NotificationContext = createContext();

    export const useNotifications = () => useContext(NotificationContext);

    export const NotificationProvider = ({ children }) => {
      const { user } = useAuth();
      const [notifications, setNotifications] = useState([]);
      const [unreadCount, setUnreadCount] = useState(0);

      useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
          const { data, error, count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error) {
            setNotifications(data);
            const unread = data.filter(n => n.status === 'unread').length;
            setUnreadCount(unread);
          }
        };

        fetchNotifications();

        const channel = supabase
          .channel(`public:notifications:user_id=eq.${user.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchNotifications)
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }, [user]);

      const markAsRead = async (id) => {
        await supabase.from('notifications').update({ status: 'read' }).eq('id', id);
      };

      const markAllAsRead = async () => {
        await supabase.from('notifications').update({ status: 'read' }).eq('user_id', user.id).eq('status', 'unread');
      };

      const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      };

      return (
        <NotificationContext.Provider value={value}>
          {children}
        </NotificationContext.Provider>
      );
    };