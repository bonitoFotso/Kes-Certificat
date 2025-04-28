// src/components/layout/AppSidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin,
  FileText,
  Home,
  ChevronDown,
  ChevronRight,
  Settings,
  HelpCircle,
  LayoutDashboard,
  X,
  Zap
} from 'lucide-react';
import {cn} from '@/lib/utils';

// Interface pour les éléments de navigation
interface NavItemBase {
  name: string;
  icon: React.ElementType;
  category: 'main' | 'habilitation' | 'footer';
}

interface NavItemWithHref extends NavItemBase {
  href: string;
  children?: never;
}

interface NavItemWithChildren extends NavItemBase {
  href?: never;
  children: Array<{
    name: string;
    href: string;
    icon: React.ElementType;
  }>;
}

type NavItem = NavItemWithHref | NavItemWithChildren;

// Propriétés du composant
interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Barre latérale de navigation de l'application
 */
export const AppSidebar: React.FC<AppSidebarProps> = ({ 
  isOpen = false,
  onClose = () => {}
}) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Configuration de la navigation
  const navigation: NavItem[] = [
    // Navigation principale
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, category: 'main' },
    { name: 'Photo', href: '/photo', icon: FileText, category: 'main' }, // Changed to FileText for document-like content
    { name: 'Photo Uploader', href: '/photoUploader', icon: FileText, category: 'main' },
    { name: 'Electrique', href: '/electrique', icon: Zap, category: 'habilitation' }, // Zap is perfect for electrical
    { name: 'Hauteur', href: '/hauteur', icon: MapPin, category: 'habilitation' }, // Changed to MapPin for height/location work
  ];

  // Navigation du pied de page
  const footerNavigation: NavItem[] = [
    { name: 'Aide', href: '/help', icon: HelpCircle, category: 'footer' },
    { name: 'Paramètres', href: '/settings', icon: Settings, category: 'footer' },
  ];

  // Basculer la visibilité des éléments de sous-menu
  const toggleCollapse = (name: string) => {
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Composant pour un élément de navigation
  const NavLink: React.FC<{ item: NavItem; depth?: number }> = ({ item, depth = 0 }) => {
    // Vérifier si l'élément est actif
    const isActive = 'href' in item ? location.pathname === item.href : false;
    
    // Icône de l'élément
    const Icon = item.icon;
    
    // Vérifier s'il a des enfants
    const hasChildren = 'children' in item && Array.isArray(item.children) && item.children.length > 0;
    
    // État d'expansion
    const isCollapsed = collapsed[item.name];
    
    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleCollapse(item.name)}
            className={cn(
              'group flex items-center w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
              'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            )}
          >
            <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
            <span className="flex-1">{item.name}</span>
            {isCollapsed ? (
              <ChevronDown className="ml-3 h-4 w-4" />
            ) : (
              <ChevronRight className="ml-3 h-4 w-4" />
            )}
          </button>
          {isCollapsed && 'children' in item && item.children && (
            <div className="mt-1 space-y-1 px-3">
              {item.children.map((child) => (
                <Link
                  key={child.name}
                  to={child.href}
                  className={cn(
                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                    location.pathname === child.href
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white',
                    'pl-11'
                  )}
                >
                  <child.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
                      location.pathname === child.href
                        ? 'text-blue-400'
                        : 'text-gray-400 group-hover:text-gray-300'
                    )}
                  />
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={'href' in item && item.href ? item.href : '#'}
        className={cn(
          'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-gray-800 text-white shadow-sm'
            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white',
          depth > 0 && 'pl-11'
        )}
      >
        <Icon
          className={cn(
            'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
            isActive
              ? 'text-blue-400'
              : 'text-gray-400 group-hover:text-gray-300'
          )}
        />
        {item.name}
      </Link>
    );
  };

  // Composant pour une section de navigation
  const NavSection: React.FC<{ 
    items: NavItem[], 
    title?: string
  }> = ({ items, title }) => (
    <div className="space-y-1">
      {title && (
        <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {title}
        </h2>
      )}
      {items.map((item) => (
        <NavLink key={item.name} item={item} />
      ))}
    </div>
  );

  return (
    <div className={cn(
      "flex h-full flex-col bg-gray-900",
      "transition-all duration-300 ease-in-out",
      "lg:translate-x-0 lg:w-64",
      isOpen ? "translate-x-0 fixed inset-y-0 left-0 z-50 w-64" : "-translate-x-full lg:translate-x-0 fixed lg:relative"
    )}>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Bouton de fermeture sur mobile */}
      {isOpen && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-gray-800 text-gray-400 lg:hidden"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* En-tête */}
      <div className={cn(
        "flex h-16 items-center justify-between px-4",
        "border-b border-gray-800",
        "bg-gray-900/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-gray-900/75"
      )}>
        <Link to="/" className="flex items-center space-x-3">
          <Home className="h-8 w-8 text-blue-500" />
          <h1 className="text-xl font-bold text-white tracking-tight">
            KES DOC_GEN
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-6 px-3 py-4",
        "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
      )}>
        <NavSection
          items={navigation.filter(item => item.category === 'main')} 
          title="Principal"
        />

      </nav>

      {/* Pied de page */}
      <div className={cn(
        "flex flex-col gap-1 p-3",
        "border-t border-gray-800",
        "bg-gray-900/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-gray-900/75"
      )}>
        {footerNavigation.map((item) => (
          <NavLink key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
};

export default AppSidebar;