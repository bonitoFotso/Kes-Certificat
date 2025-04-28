import React from 'react';
import { Bell, LogOut, Search, Moon, Sun, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isScrolled?: boolean;
}

export function Header({ isScrolled }: HeaderProps) {
  // const { logout, user } = useAuth();
  const [isDark, setIsDark] = React.useState(false);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    { id: 1, text: "Nouveau message", unread: true },
    { id: 2, text: "Mise à jour système", unread: true }
  ]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const notificationCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    try {
  // await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 h-16",
        "bg-white/80 dark:bg-gray-800/80",
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
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>

        {/* Search Section */}
        <div className="hidden sm:flex items-center flex-1 max-w-2xl">
          <div className="relative w-full group">
            <Search 
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                "transition-colors duration-200",
                isSearchFocused 
                  ? "text-indigo-500 dark:text-indigo-400"
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
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                "focus:border-transparent",
                "transition-all duration-200"
              )}
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
              "transition-colors duration-200"
            )}
            aria-label={isDark ? "Mode clair" : "Mode sombre"}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "relative p-2 rounded-lg",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                "transition-colors duration-200"
              )}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
              )}
            </button>

            {/* Dropdown Notifications */}
            {showNotifications && (
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
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
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
                          className={cn(
                            "p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                            "transition-colors duration-200",
                            notification.unread && "bg-indigo-50 dark:bg-indigo-900/10"
                          )}
                        >
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {notification.text}
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

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn(
              "p-2 rounded-lg",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "group focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
              "transition-colors duration-200"
            )}
            aria-label="Déconnexion"
          >
            <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          </button>

          {/* User Profile 
          <div className="hidden sm:flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="flex flex-col text-right">
              {user?.username && (
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user.username}
                </span>
              )}
              {user?.email && (
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {user.email}
                </span>
              )}
              {user?.departement && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.departement}
                </span>
              )}
            </div> 
            <div className="relative">
              <div className={cn(
                "flex items-center justify-center",
                "h-10 w-10 rounded-full",
                "bg-gray-100 dark:bg-gray-700",
                "overflow-hidden",
                "ring-2 ring-transparent hover:ring-indigo-500 dark:hover:ring-indigo-400",
                "transition-all duration-200",
                "cursor-pointer"
              )}>
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </div>*/}
        </div>
      </div>

      {/* Menu mobile overlay 
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className={cn(
            "fixed top-16 left-0 right-0",
            "bg-white dark:bg-gray-800",
            "border-b border-gray-200 dark:border-gray-700",
            "p-4",
            "z-40",
            "animate-scale-in"
          )}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex flex-col">
                {user?.username && (
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {user.username}
                  </span>
                )}
                {user?.email && (
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {user.email}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher..."
                className={cn(
                  "w-full h-10 pl-10 pr-4 rounded-lg",
                  "bg-gray-50 dark:bg-gray-900",
                  "border border-gray-200 dark:border-gray-700",
                  "text-sm text-gray-900 dark:text-gray-100",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                  "focus:border-transparent",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>
        </div>
      )}*/}
    </header>
  );
}