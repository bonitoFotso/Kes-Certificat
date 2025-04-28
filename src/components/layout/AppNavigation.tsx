// src/components/layout/AppNavigation.tsx
import React from 'react';
import { FileSpreadsheet, HelpCircle, Bell, Menu } from 'lucide-react';
import Button from '../common/Button';
import {cn} from '@/lib/utils';

interface AppNavigationProps {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

/**
 * Barre de navigation supérieure de l'application
 */
export const AppNavigation: React.FC<AppNavigationProps> = ({ 
  showHelp, 
  setShowHelp 
}) => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo et Titre */}
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Générateur de Certificats
            </h1>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Bouton d'aide */}
            <Button
              onClick={() => setShowHelp(!showHelp)}
              variant="ghost"
              size="sm"
              iconLeft={<HelpCircle className="w-5 h-5" />}
              className={cn(
                showHelp && "bg-blue-50 text-blue-600"
              )}
              aria-label="Aide"
            >
              <span className="hidden sm:inline">Aide</span>
            </Button>
            
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<Bell className="w-5 h-5" />}
                aria-label="Notifications"
              >
                <span className="hidden sm:inline">Notifications</span>
              </Button>
              {/* Indicateur de notification */}
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </div>
            
            {/* Menu mobile (affiché uniquement sur petits écrans) */}
            <Button
                          variant="ghost"
                          size="sm"
                          iconLeft={<Menu className="w-5 h-5" />}
                          className="lg:hidden"
                          aria-label="Menu" children={undefined}            />
          </div>
        </div>
      </div>
      
      {/* Barre de progression sous la navigation (facultatif) */}
      <div className="h-1 bg-blue-600 w-1/3 hidden" />
    </nav>
  );
};

export default AppNavigation;