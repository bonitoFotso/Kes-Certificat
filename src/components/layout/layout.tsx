import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { Settings, ChevronUp } from 'lucide-react';

export function Layout() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const mainRef = React.useRef<HTMLElement>(null);

  // Gérer le scroll
  React.useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setIsScrolled(target.scrollTop > 0);
      setShowScrollTop(target.scrollTop > 400);
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    mainRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header isScrolled={isScrolled} />

        {/* Main Content */}
        <main
          ref={mainRef}
          className={cn(
            "flex-1 overflow-y-auto",
            "bg-gray-100 dark:bg-gray-800",
            "px-4 sm:px-6 lg:px-8 py-6",
            "transition-colors duration-200",
            "scroll-smooth"
          )}
        >
          {/* Content wrapper */}
          <div className="mx-auto w-full">
            <Outlet />
          </div>

          {/* Scroll to top button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className={cn(
                "fixed bottom-20 right-8",
                "p-2 rounded-full",
                "bg-white dark:bg-gray-700",
                "shadow-lg dark:shadow-gray-900/50",
                "text-gray-600 dark:text-gray-200",
                "hover:bg-gray-50 dark:hover:bg-gray-600",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                "transition-all duration-200",
                "animate-fade-in"
              )}
              aria-label="Retour en haut"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          )}
        </main>

        {/* Footer */}
        <footer className={cn(
          "border-t border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-800",
          "transition-colors duration-200",
          isScrolled ? "shadow-md" : ""
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 KES DOC_GEN. All rights reserved.
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  className={cn(
                    "p-2 rounded-lg",
                    "text-gray-500 dark:text-gray-400",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    "transition-colors duration-200"
                  )}
                  aria-label="Paramètres"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Layout