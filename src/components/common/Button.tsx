// src/components/common/Button.tsx
import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import {cn} from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Composant Button réutilisable avec différentes variantes et tailles
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      iconLeft,
      iconRight,
      loading = false,
      loadingText,
      fullWidth = false,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Styles pour les variantes
    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
      info: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400'
    };

    // Styles pour les tailles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    // Styles pour le spacing des icônes
    const iconSpacing = {
      sm: 'gap-1.5',
      md: 'gap-2',
      lg: 'gap-2.5',
      xl: 'gap-3'
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          // Styles de base
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'shadow-sm',
          // Styles de variantes et tailles
          variantStyles[variant],
          sizeStyles[size],
          // Largeur complète
          fullWidth && 'w-full',
          // Espacement des icônes
          (iconLeft || iconRight || loading) && iconSpacing[size],
          // Classes personnalisées
          className
        )}
        {...props}
      >
        {/* Loader si en chargement */}
        {loading && (
          <Loader2 className={cn('animate-spin', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        )}

        {/* Icône gauche si non en chargement */}
        {!loading && iconLeft}

        {/* Texte principal */}
        <span>{loading && loadingText ? loadingText : children}</span>

        {/* Icône droite */}
        {!loading && iconRight}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;