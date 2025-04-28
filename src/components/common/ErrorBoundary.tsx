// src/components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Composant qui capture les erreurs JavaScript dans ses composants enfants,
 * les enregistre et affiche une interface de secours.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Mettre à jour l'état pour que le prochain rendu affiche l'UI de secours
    return { 
      hasError: true, 
      error,
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Vous pouvez aussi enregistrer l'erreur auprès d'un service de rapport d'erreurs
    this.setState({ errorInfo });
    
    // Enregistrer l'erreur dans la console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Exemple d'envoi à un service d'erreur
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Afficher l'UI de secours personnalisée ou celle fournie via les props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de secours par défaut
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center mb-6">
              <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Une erreur est survenue
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              Nous sommes désolés, mais quelque chose s'est mal passé. Veuillez réessayer ou contacter le support si le problème persiste.
            </p>
            
            {this.state.error && (
              <div className="bg-red-50 p-4 rounded-lg mb-6 overflow-auto max-h-36">
                <p className="text-sm font-mono text-red-800">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                iconLeft={<RefreshCw className="h-4 w-4" />}
              >
                Rafraîchir la page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Si pas d'erreur, afficher les enfants normalement
    return this.props.children;
  }
}

export default ErrorBoundary;