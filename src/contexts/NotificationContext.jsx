import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const sendNotification = (targetRole, titleKey, messageKey, messageParams = {}, type = 'info') => {
    const title = t(titleKey, messageParams);
    const message = t(messageKey, messageParams);

    const notification = {
      id: Date.now().toString(),
      targetRole,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [notification, ...prev]);

    if (user && (user.role === targetRole || targetRole === 'all')) {
      toast({
        title,
        description: message,
        variant: type === 'error' ? 'destructive' : 'default',
      });
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    ));
  };

  const getUserNotifications = () => {
    if (!user) return [];
    return notifications.filter(notif => notif.targetRole === user.role || notif.targetRole === 'all');
  };

  const getUnreadCount = () => {
    return getUserNotifications().filter(notif => !notif.read).length;
  };

  const value = {
    notifications,
    sendNotification,
    markAsRead,
    getUserNotifications,
    getUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};