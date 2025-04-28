// src/components/certificates/SingleFileUploader.tsx
import React, { useState } from 'react';
import { FileSpreadsheet, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { FileUploader } from '../common/FileUploader';
import { Button } from '../common/Button';
import { ExcelData } from '../../types/certificate';
import { formatFileSize } from '../../utils/file';

interface SingleFileUploaderProps {
  onFileLoad: (data: ExcelData, file: File) => void;
  accept?: string[];
  maxFileSize?: number;
}

/**
 * Composant pour télécharger un seul fichier Excel 
 * et prévisualiser le fichier sélectionné
 */
export const SingleFileUploader: React.FC<SingleFileUploaderProps> = ({
  onFileLoad,
  accept = ['.xlsx', '.xls'],
  maxFileSize
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<ExcelData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gestionnaire pour le chargement de fichier réussi
  const handleFileLoaded = (data: ExcelData, file: File) => {
    setSelectedFile(file);
    setFileData(data);
    setError(null);
    onFileLoad(data, file);
  };

  // Gestionnaire pour supprimer le fichier
  const handleClearFile = () => {
    setSelectedFile(null);
    setFileData(null);
    setError(null);
  };

  // Obtenir le nombre total de lignes dans le fichier
  const getTotalRows = (): number => {
    if (!fileData) return 0;
    
    const sheetName = Object.keys(fileData)[0];
    if (!sheetName) return 0;
    
    return fileData[sheetName].length;
  };

  // Obtenir le nombre de feuilles dans le fichier
  const getSheetCount = (): number => {
    if (!fileData) return 0;
    return Object.keys(fileData).length;
  };

  return (
    <div className="space-y-6">
      {!selectedFile ? (
        <FileUploader 
          onFileLoad={handleFileLoaded} 
          accept={accept}
          maxSize={maxFileSize}
          label="Glissez-déposez votre fichier Excel"
          subLabel="ou parcourez vos fichiers"
          helpText={`Formats acceptés: ${accept.join(', ')}`}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedFile.name}
                </h3>
                
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  
                  {fileData && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {getTotalRows()} lignes
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {getSheetCount()} feuille{getSheetCount() > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-600">{error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<Trash2 className="h-4 w-4" />}
              onClick={handleClearFile}
              className="text-gray-500 hover:text-red-500"
            >
              Supprimer
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Le fichier est prêt à être traité. Consultez l'aperçu des données ci-dessous pour vérifier le contenu avant de générer les certificats.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleFileUploader;