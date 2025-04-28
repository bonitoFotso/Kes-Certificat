// src/api/services/types.ts

/**
 * Callback pour suivre la progression d'un téléchargement de fichier
 */
export type FileUploadProgressCallback = (fileName: string, percentCompleted: number) => void;

/**
 * Réponse d'une génération de certificat
 */
export interface CertificateGenerationResponse {
  data: Blob;
  filename: string;
  contentType: string;
}

/**
 * Types d'erreurs API possibles
 */
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Erreur API structurée
 */
export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}