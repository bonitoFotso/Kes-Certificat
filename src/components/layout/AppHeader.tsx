// src/components/layout/AppHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Search, Moon, Sun, Menu} from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import {cn} from '@/lib/utils';


interface AppHeaderProps {
  isScrolled?: boolean;
  onMenuClick?: () => void;
}

/**
 * En-tête de l'application avec fonctionnalités de recherche, notifications et thème
 */
export const AppHeader: React.FC<AppHeaderProps> = ({ 
  isScrolled = false,
  onMenuClick
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    text: string;
    unread: boolean;
    date: Date;
  }>>([
    { id: 1, text: "Nouveau message", unread: true, date: new Date() },
    { id: 2, text: "Mise à jour système", unread: true, date: new Date(Date.now() - 86400000) }
  ]);

  const notificationCount = notifications.filter(n => n.unread).length;
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown de notifications en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // Marquer une notification comme lue
  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  // Formater la date de notification
  const formatNotificationDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffDays > 0) {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'à l\'instant';
    }
  };

  // Gestionnaire de déconnexion
  const handleLogout = () => {
    // Logique de déconnexion ici
    console.log('Déconnexion');
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 h-16",
        "bg-white/90 dark:bg-gray-800/90",
        "border-b border-gray-200 dark:border-gray-700",
        "backdrop-blur-sm",
        "transition-all duration-200",
        isScrolled && "shadow-sm"
      )}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-between">
        {/* Menu mobile */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={onMenuClick}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Section de recherche */}
        <div className="hidden sm:flex items-center flex-1 max-w-2xl">
          <div className="relative w-full group">
            <Search 
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                "transition-colors duration-200",
                isSearchFocused 
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500"
              )}
            />
            <input
              type="search"
              placeholder="Rechercher..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "w-full h-10 pl-10 pr-4 rounded-lg",
                "bg-gray-50 dark:bg-gray-900",
                "border border-gray-200 dark:border-gray-700",
                "text-sm text-gray-900 dark:text-gray-100",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                "focus:border-transparent",
                "transition-all duration-200"
              )}
            />
          </div>
        </div>

        {/* Section des actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Bascule de thème */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
              "transition-colors duration-200"
            )}
            aria-label={isDarkMode ? "Mode clair" : "Mode sombre"}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={cn(
                "relative p-2 rounded-lg",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                "transition-colors duration-200"
              )}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
              )}
            </button>

            {/* Dropdown des notifications */}
            {notificationsOpen && (
              <div className={cn(
                "absolute right-0 mt-2 w-80",
                "bg-white dark:bg-gray-800",
                "rounded-lg shadow-lg",
                "border border-gray-200 dark:border-gray-700",
                "animate-scale-in",
                "z-50"
              )}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                    {notificationCount > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAllNotificationsAsRead();
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markNotificationAsRead(notification.id)}
                          className={cn(
                            "p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                            "transition-colors duration-200 cursor-pointer",
                            notification.unread && "bg-blue-50 dark:bg-blue-900/10"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                              {notification.text}
                            </p>
                            {notification.unread && (
                              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatNotificationDate(notification.date)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Aucune notification
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className={cn(
              "p-2 rounded-lg",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "group focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
              "transition-colors duration-200"
            )}
            aria-label="Déconnexion"
          >
            <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;