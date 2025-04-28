// src/utils/file.ts
import { read, utils, WorkBook, WorkSheet } from 'xlsx';
import { ExcelData } from '../types/certificate';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '../constants/appConfig';

/**
 * Vérifie si le fichier est un fichier Excel valide
 */
export const isExcelFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  // Vérifier le type MIME
  const mimeTypeValid = validTypes.includes(file.type);
  
  // Vérifier l'extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const extensionValid = extension === 'xlsx' || extension === 'xls';
  
  return mimeTypeValid || extensionValid;
};

/**
 * Vérifie si le fichier est dans la liste des types acceptés
 */
export const isAcceptedFileType = (file: File, acceptedTypes: string[] = ACCEPTED_FILE_TYPES.EXCEL): boolean => {
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  return acceptedTypes.includes(extension);
};

/**
 * Vérifie si la taille du fichier est dans les limites
 */
export const isFileSizeValid = (file: File, maxSize: number = MAX_FILE_SIZE): boolean => {
  return file.size <= maxSize;
};

/**
 * Formate la taille du fichier pour l'affichage
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Lit un fichier Excel et retourne les données sous forme d'objet
 */
export const readExcelFile = (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook: WorkBook = read(data, { type: 'array' });
        
        const result: ExcelData = {};
        
        // Parcourir toutes les feuilles du classeur
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet: WorkSheet = workbook.Sheets[sheetName];
          result[sheetName] = utils.sheet_to_json(worksheet);
        });
        
        resolve(result);
      } catch (error) {
        reject(new Error(`Erreur lors de la lecture du fichier Excel: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Télécharge un fichier à partir d'un Blob
 */
export const downloadFile = (blob: Blob, fileName: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Obtient l'icône appropriée en fonction du type de fichier
 */
export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
      return 'FileSpreadsheet';
    case 'pdf':
      return 'FilePdf';
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'Image';
    default:
      return 'File';
  }
};