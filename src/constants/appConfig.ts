// src/constants/appConfig.ts

/**
 * Configuration globale de l'application
 */

// Environnement
export const IS_DEVELOPMENT = import.meta.env.MODE === 'development';
export const IS_PRODUCTION = import.meta.env.MODE === 'production';

// API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_TIMEOUT = 30000; // 30 secondes

// Fichiers
export const ACCEPTED_FILE_TYPES = {
  EXCEL: ['.xlsx', '.xls'],
  PDF: ['.pdf'],
  IMAGE: ['.jpg', '.jpeg', '.png']
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Interface utilisateur
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
  PAGINATION_SIZE: 10
};

// Locales
export const DEFAULT_LOCALE = 'fr-FR';
export const DATE_FORMAT = 'dd/MM/yyyy';
export const TIME_FORMAT = 'HH:mm';

// Fonctionnalités
export const FEATURES = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
  FILE_PREVIEW: true
};