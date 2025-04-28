// src/hooks/useTheme.ts
import { useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark';

interface UseThemeReturn {
  isDarkMode: boolean;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

/**
 * Hook personnalisé pour gérer le thème sombre/clair
 */
export const useTheme = (): UseThemeReturn => {
  // Récupérer la préférence initiale du système ou du localStorage
  const getInitialTheme = (): ThemeMode => {
    // Vérifier si un thème est stocké dans localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Vérifier la préférence du système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);

  // Appliquer le thème au document
  const applyTheme = useCallback((newTheme: ThemeMode) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Mettre à jour la couleur du thème pour les navigateurs mobiles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        newTheme === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  }, []);

  // Mettre à jour le thème et le stocker
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Basculer entre les thèmes
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Synchroniser le thème avec la préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Ne mettre à jour que si l'utilisateur n'a pas explicitement défini de préférence
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Ajouter un écouteur d'événement pour les changements de préférence système
    mediaQuery.addEventListener('change', handleChange);

    // Appliquer le thème initial
    applyTheme(theme);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, setTheme, theme]);

  return {
    isDarkMode: theme === 'dark',
    theme,
    toggleTheme,
    setTheme
  };
};

export default useTheme;