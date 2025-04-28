// src/hooks/useFileUpload.ts
import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { FileWithStatus, FileStatus, ExcelData } from '../types/certificate';
import { isExcelFile, isFileSizeValid, readExcelFile } from '../utils/file';
import { MAX_FILE_SIZE } from '../constants/appConfig';

interface UseFileUploadOptions {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  onFileRead?: (data: ExcelData, file: File) => void;
}

interface UseFileUploadReturn {
  files: FileWithStatus[];
  isDragging: boolean;
  error: string;
  progress: Record<string, number>;
  currentProcessing: number | null;
  isLoading: boolean;
  handleDragEnter: (e: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleFileInput: (e: ChangeEvent<HTMLInputElement>) => void;
  removeFile: (fileName: string) => void;
  updateFileStatus: (fileName: string, status: FileStatus, error?: string) => void;
  updateFileProgress: (fileName: string, progress: number) => void;
  resetFiles: () => void;
}

/**
 * Hook personnalisé pour gérer le téléchargement et le suivi des fichiers
 */
export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
  const {
    maxFiles = Infinity,
    maxFileSize = MAX_FILE_SIZE,
    acceptedFileTypes = ['.xlsx', '.xls'],
    onFileRead
  } = options;

  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [currentProcessing, setCurrentProcessing] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Gère les événements de glisser-déposer
   */
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

    /**
   * Met à jour le statut d'un fichier
   */
    const updateFileStatus = useCallback((fileName: string, status: FileStatus, error?: string) => {
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.file.name === fileName 
              ? { ...f, status, error } 
              : f
          )
        );
      }, []);

  /**
   * Vérifie si un fichier est valide
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Vérifier le type de fichier
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFileTypes.includes(extension) && !isExcelFile(file)) {
      return { 
        valid: false, 
        error: `Le fichier "${file.name}" n'est pas dans un format accepté (${acceptedFileTypes.join(', ')})` 
      };
    }

    // Vérifier la taille du fichier
    if (!isFileSizeValid(file, maxFileSize)) {
      return { 
        valid: false, 
        error: `Le fichier "${file.name}" dépasse la taille maximale autorisée (${maxFileSize / 1024 / 1024} MB)` 
      };
    }

    return { valid: true };
  }, [acceptedFileTypes, maxFileSize]);

  /**
   * Gère le dépôt de fichiers
   */
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError('');

    const droppedFiles = Array.from(e.dataTransfer.files);
    
    // Vérifier si l'ajout de ces fichiers dépasserait le maximum
    if (files.length + droppedFiles.length > maxFiles) {
      setError(`Vous ne pouvez pas télécharger plus de ${maxFiles} fichiers à la fois`);
      return;
    }

    // Filtrer et valider les fichiers
    const newFiles: FileWithStatus[] = [];
    
    for (const file of droppedFiles) {
      const { valid, error } = validateFile(file);
      
      if (valid) {
        newFiles.push({
          file,
          status: FileStatus.PENDING
        });

        // Si un callback de lecture est fourni, lire le fichier
        if (onFileRead) {
          readExcelFile(file)
            .then(data => onFileRead(data, file))
            .catch(err => {
              setError(`Erreur lors de la lecture du fichier "${file.name}": ${err.message}`);
              updateFileStatus(file.name, FileStatus.ERROR, err.message);
            });
        }
      } else if (error) {
        setError(error);
      }
    }

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, [files.length, maxFiles, validateFile, onFileRead, updateFileStatus]);

  /**
   * Gère l'entrée de fichiers via l'input
   */
  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    
    if (!e.target.files || e.target.files.length === 0) return;
    
    const selectedFiles = Array.from(e.target.files);
    
    // Vérifier si l'ajout de ces fichiers dépasserait le maximum
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Vous ne pouvez pas télécharger plus de ${maxFiles} fichiers à la fois`);
      return;
    }

    // Filtrer et valider les fichiers
    const newFiles: FileWithStatus[] = [];
    
    for (const file of selectedFiles) {
      const { valid, error } = validateFile(file);
      
      if (valid) {
        newFiles.push({
          file,
          status: FileStatus.PENDING
        });

        // Si un callback de lecture est fourni, lire le fichier
        if (onFileRead) {
          readExcelFile(file)
            .then(data => onFileRead(data, file))
            .catch(err => {
              setError(`Erreur lors de la lecture du fichier "${file.name}": ${err.message}`);
              updateFileStatus(file.name, FileStatus.ERROR, err.message);
            });
        }
      } else if (error) {
        setError(error);
      }
    }

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    
    // Réinitialiser l'input pour permettre la sélection du même fichier
    e.target.value = '';
  }, [files.length, maxFiles, validateFile, onFileRead, updateFileStatus]);

  /**
   * Supprime un fichier de la liste
   */
  const removeFile = useCallback((fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.file.name !== fileName));
    setError('');
  }, []);



  /**
   * Met à jour la progression d'un fichier
   */
  const updateFileProgress = useCallback((fileName: string, progressValue: number) => {
    setProgress(prev => ({
      ...prev,
      [fileName]: progressValue
    }));
  }, []);

  /**
   * Réinitialise tous les fichiers
   */
  const resetFiles = useCallback(() => {
    setFiles([]);
    setError('');
    setProgress({});
    setCurrentProcessing(null);
    setIsLoading(false);
  }, []);

  return {
    files,
    isDragging,
    error,
    progress,
    currentProcessing,
    isLoading,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInput,
    removeFile,
    updateFileStatus,
    updateFileProgress,
    resetFiles
  };
};

export default useFileUpload;