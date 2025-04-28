// src/components/common/ProgressBar.tsx
import { cn } from '@/lib/utils';
import React from 'react';

export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ProgressBarProps {
  /**
   * Valeur actuelle de la progression (0-100)
   */
  value: number;
  
  /**
   * Taille de la barre de progression
   */
  size?: ProgressBarSize;
  
  /**
   * Variante de couleur
   */
  variant?: ProgressBarVariant;
  
  /**
   * Afficher le pourcentage en texte
   */
  showLabel?: boolean;
  
  /**
   * Position de l'étiquette
   */
  labelPosition?: 'inside' | 'right' | 'top';
  
  /**
   * Animation de la barre de progression
   */
  animated?: boolean;
  
  /**
   * Si la barre de progression est indéterminée
   */
  indeterminate?: boolean;
  
  /**
   * Classes CSS personnalisées
   */
  className?: string;
}

/**
 * Composant ProgressBar pour afficher la progression d'une opération
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  size = 'md',
  variant = 'default',
  showLabel = false,
  labelPosition = 'right',
  animated = false,
  indeterminate = false,
  className
}) => {
  // Assurer que la valeur est entre 0 et 100
  const clampedValue = Math.min(100, Math.max(0, value));
  
  // Styles pour les tailles
  const sizeStyles = {
    xs: 'h-1',
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6'
  };
  
  // Styles pour les variantes
  const variantStyles = {
    default: 'bg-blue-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-indigo-500'
  };
  
  // Styles pour l'étiquette en fonction de la position
  const labelStyles = {
    inside: cn(
      'absolute inset-0 flex items-center justify-center',
      'text-white font-semibold',
      size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm'
    ),
    right: 'ml-3 text-sm text-gray-600',
    top: 'mb-1 text-sm text-gray-600'
  };
  
  return (
    <div className={cn('w-full', className)}>
      {/* Étiquette supérieure */}
      {showLabel && labelPosition === 'top' && (
        <div className={labelStyles.top}>{clampedValue}%</div>
      )}
      
      {/* Conteneur de la barre de progression */}
      <div className="relative">
        {/* Fond de la barre */}
        <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeStyles[size])}>
          {/* Barre de progression */}
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-300',
              variantStyles[variant],
              animated && !indeterminate && 'animate-pulse',
              indeterminate && 'animate-progress-indeterminate'
            )}
            style={{ 
              width: `${indeterminate ? 100 : clampedValue}%`,
              ...(indeterminate ? { transform: 'translateX(-100%)' } : {})
            }}
          />
          
          {/* Étiquette interne */}
          {showLabel && labelPosition === 'inside' && size !== 'xs' && (
            <div className={labelStyles.inside}>
              {clampedValue}%
            </div>
          )}
        </div>
      </div>
      
      {/* Étiquette à droite */}
      {showLabel && labelPosition === 'right' && (
        <div className="flex items-center">
          <div className="flex-1" />
          <div className={labelStyles.right}>{clampedValue}%</div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;