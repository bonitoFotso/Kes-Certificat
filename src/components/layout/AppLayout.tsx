// src/components/layout/AppLayout.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Settings, ChevronUp } from 'lucide-react';
import { createPortal } from 'react-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import {cn} from '@/lib/utils';

interface AppLayoutProps {
  children?: React.ReactNode;
}

/**
 * Composant de mise en page principale de l'application
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const mainRef = useRef<HTMLElement>(null);

  // Gérer le scroll
  useEffect(() => {
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

  // Scroll vers le haut
  const scrollToTop = () => {
    mainRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Fermeture de la sidebar sur les petits écrans lors du changement de page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AppHeader 
          isScrolled={isScrolled} 
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Contenu principal */}
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
          {/* Conteneur du contenu */}
          <div className="w-full mx-auto">
            {children || <Outlet />}
          </div>

          {/* Bouton de retour en haut */}
          {showScrollTop && createPortal(
            <button
              onClick={scrollToTop}
              className={cn(
                "fixed bottom-20 right-8",
                "p-2 rounded-full",
                "bg-white dark:bg-gray-700",
                "shadow-lg dark:shadow-gray-900/50",
                "text-gray-600 dark:text-gray-200",
                "hover:bg-gray-50 dark:hover:bg-gray-600",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                "transition-all duration-200",
                "animate-fade-in z-50"
              )}
              aria-label="Retour en haut"
            >
              <ChevronUp className="h-5 w-5" />
            </button>,
            document.body
          )}
        </main>

        {/* Pied de page */}
        <footer className={cn(
          "border-t border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-800",
          "transition-colors duration-200",
          isScrolled ? "shadow-md" : ""
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} KES ATTEST EASY. Bonito Fotso.
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  className={cn(
                    "p-2 rounded-lg",
                    "text-gray-500 dark:text-gray-400",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
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
};

export default AppLayout;