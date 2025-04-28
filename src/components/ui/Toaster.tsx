// src/components/ui/Toaster.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import {cn} from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

interface ToastOptions {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// Création du contexte
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Composant Toast individuel
const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose }) => {
  useEffect(() => {
    // Timer pour fermer automatiquement
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // 5 secondes par défaut

    return () => clearTimeout(timer);
  }, [id, onClose]);

  // Icônes et styles selon le type
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  const styles = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-amber-200 bg-amber-50',
    info: 'border-blue-200 bg-blue-50'
  };

  const textStyles = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-amber-800',
    info: 'text-blue-800'
  };

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-lg border shadow-sm p-4 pointer-events-auto',
        'animate-slide-in-right',
        styles[type]
      )}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="ml-3 w-0 flex-1">
          {title && (
            <p className={cn('text-sm font-medium', textStyles[type])}>
              {title}
            </p>
          )}
          <div className={cn('mt-1 text-sm', textStyles[type])}>
            {message}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={() => onClose(id)}
          >
            <span className="sr-only">Fermer</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Provider du Toaster
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<Omit<ToastProps, 'onClose'>>>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [
      ...prev,
      { id, ...options }
    ]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    return addToast(options);
  }, [addToast]);

  const success = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'success', message, title, duration });
  }, [addToast]);

  const error = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'error', message, title, duration });
  }, [addToast]);

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'warning', message, title, duration });
  }, [addToast]);

  const info = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ type: 'info', message, title, duration });
  }, [addToast]);

  const value = {
    toast,
    success,
    error,
    warning,
    info,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof window !== 'undefined' && createPortal(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-4 w-full max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              onClose={dismissToast}
              {...toast}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// Hook pour utiliser le Toaster
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Composant Toaster pour l'application
export const Toaster: React.FC = () => {
  // Créer un portail pour afficher les toasts
  return typeof window !== 'undefined' 
    ? createPortal(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-4 w-full max-w-sm pointer-events-none">
          {/* Les toasts seront injectés ici */}
        </div>,
        document.body
      )
    : null;
};

export default Toaster;