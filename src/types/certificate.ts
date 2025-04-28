// src/types/certificate.ts

/**
 * Types de modes de certificat
 */
export enum CertificateMode {
    STANDARD = 'ATT',
    ELECTRICAL = 'THEL',
    HEIGHT_WORK = 'THTH'
  }
  
  /**
   * Type pour les données Excel
   */
  export interface ExcelData {
    [sheetName: string]: Array<Record<string, unknown>>;
  }
  
  /**
   * Statuts possibles d'un fichier
   */
  export enum FileStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    ERROR = 'error'
  }
  
  /**
   * Interface pour un fichier avec son statut
   */
  export interface FileWithStatus {
    file: File;
    status: FileStatus;
    progress?: number;
    error?: string;
  }
  
  /**
   * Interface pour la prévisualisation des données
   */
  export interface DataPreviewProps {
    data: ExcelData;
    onValidate: () => void;
    isLoading: boolean;
  }
  
  /**
   * Interface pour les propriétés du sélecteur de mode
   */
  export interface CertificateModeProps {
    mode: CertificateMode;
    setMode: (mode: CertificateMode) => void;
  }
  
  /**
   * Interface pour les propriétés du chargeur de fichiers
   */
  export interface FileUploaderProps {
    onFileLoad: (data: ExcelData, file: File) => void;
    accept?: string[];
    multiple?: boolean;
  }
  
  /**
   * Interface pour les propriétés du multi-chargeur
   */
  export interface MultiFileUploaderProps {
    onFilesProcessed?: (successCount: number, errorCount: number) => void;
    maxFileSize?: number;
    accept?: string[];
  }
  
  /**
   * Structure d'un certificat
   */
  export interface Certificate {
    id: string;
    type: CertificateMode;
    title: string;
    recipientName: string;
    issueDate: Date;
    expiryDate?: Date;
    issuedBy: string;
    documentUrl: string;
    metadata: Record<string, unknown>;
  }