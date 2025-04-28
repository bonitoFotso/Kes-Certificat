// src/components/certificates/MultiFileUploader.tsx
import React, { useState, useCallback } from 'react';
import { Upload, Trash2, FileSpreadsheet, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { certificateService } from '../../api/services/certificateService';
import { FileStatus } from '../../types/certificate';
import { formatFileSize } from '../../utils/file';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import {cn} from '@/lib/utils';

interface MultiFileUploaderProps {
  onFilesProcessed?: (successCount: number, errorCount: number) => void;
  maxFileSize?: number;
  accept?: string[];
}

/**
 * Composant pour télécharger et traiter plusieurs fichiers Excel simultanément
 */
export const MultiFileUploader: React.FC<MultiFileUploaderProps> = ({
  onFilesProcessed,
  maxFileSize,
  accept = ['.xlsx', '.xls']
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedCount, setProcessedCount] = useState<{ success: number; error: number }>({
    success: 0,
    error: 0
  });

  const {
    files,
    isDragging,
    error,
    progress,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInput,
    removeFile,
    updateFileStatus,
    updateFileProgress,
    resetFiles
  } = useFileUpload({
    maxFiles: 20,
    maxFileSize,
    acceptedFileTypes: accept
  });

  // Réinitialiser les compteurs lorsque les fichiers changent
  React.useEffect(() => {
    setProcessedCount({ success: 0, error: 0 });
  }, [files]);

  // Traiter tous les fichiers en attente
  const processAllFiles = useCallback(async () => {
    if (files.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === FileStatus.PENDING) {
        // Mise à jour du statut
        updateFileStatus(files[i].file.name, FileStatus.PROCESSING);

        try {
          // Génération du certificat avec suivi de progression
          const result = await certificateService.generateElectricalCertificate(
            files[i].file,
            (fileName, percentCompleted) => {
              updateFileProgress(fileName, percentCompleted);
            }
          );

          // Téléchargement du certificat généré
          certificateService.downloadCertificate(result.data, result.filename);
          
          // Mise à jour du statut de réussite
          updateFileStatus(files[i].file.name, FileStatus.COMPLETED);
          successCount++;
        } catch (error) {
          // Mise à jour du statut d'erreur
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          updateFileStatus(files[i].file.name, FileStatus.ERROR, errorMessage);
          errorCount++;
        }
      }
    }
    
    setProcessedCount(prev => ({ 
      success: prev.success + successCount, 
      error: prev.error + errorCount 
    }));
    
    setIsProcessing(false);
    
    // Notification au composant parent
    if (onFilesProcessed) {
      onFilesProcessed(successCount, errorCount);
    }
  }, [files, isProcessing, updateFileStatus, updateFileProgress, onFilesProcessed]);

  const getStatusIcon = useCallback((status: FileStatus) => {
    switch (status) {
      case FileStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case FileStatus.ERROR:
        return <XCircle className="h-5 w-5 text-red-500" />;
      case FileStatus.PROCESSING:
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-gray-500" />;
    }
  }, []);

  const getStatusColor = useCallback((status: FileStatus) => {
    switch (status) {
      case FileStatus.COMPLETED:
        return 'text-green-500';
      case FileStatus.ERROR:
        return 'text-red-500';
      case FileStatus.PROCESSING:
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  }, []);

  const getStatusText = useCallback((status: FileStatus) => {
    switch (status) {
      case FileStatus.COMPLETED:
        return 'Terminé';
      case FileStatus.ERROR:
        return 'Erreur';
      case FileStatus.PROCESSING:
        return 'En cours...';
      default:
        return 'En attente';
    }
  }, []);

  const pendingFiles = files.filter(f => f.status === FileStatus.PENDING).length;
  const completedFiles = files.filter(f => f.status === FileStatus.COMPLETED).length;
  const errorFiles = files.filter(f => f.status === FileStatus.ERROR).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
          files.length > 0 ? "bg-gray-50" : "bg-white",
          "hover:border-blue-400 hover:bg-blue-50/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={accept.join(',')}
          onChange={handleFileInput}
          className="hidden"
          id="multi-file-upload"
        />

        <label
          htmlFor="multi-file-upload"
          className="cursor-pointer block"
        >
          <div className="text-center">
            <Upload
              className={cn(
                "mx-auto h-12 w-12 transition-colors duration-200",
                isDragging ? "text-blue-500" : "text-gray-400"
              )}
            />
            <p className="mt-4 text-sm text-gray-600">
              <span className="font-semibold text-blue-500">Cliquez pour télécharger</span> ou glissez-déposez
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Vous pouvez sélectionner plusieurs fichiers.
              <br />
              Formats acceptés : {accept.join(', ')}
            </p>
          </div>
        </label>

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6">
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {files.map((fileStatus) => (
                <div
                  key={fileStatus.file.name}
                  className={cn(
                    "group bg-white rounded-lg p-3 border transition-colors duration-200",
                    fileStatus.status === FileStatus.PROCESSING 
                      ? "border-blue-300 bg-blue-50" 
                      : "border-gray-200 hover:border-blue-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(fileStatus.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {fileStatus.file.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">
                            {formatFileSize(fileStatus.file.size)}
                          </p>
                          <span className={cn("text-xs", getStatusColor(fileStatus.status))}>
                            • {getStatusText(fileStatus.status)}
                          </span>
                        </div>
                        {fileStatus.error && (
                          <p className="text-xs text-red-500 mt-1">{fileStatus.error}</p>
                        )}
                      </div>
                    </div>
                    
                    {fileStatus.status !== FileStatus.PROCESSING && (
                      <button
                        onClick={() => removeFile(fileStatus.file.name)}
                        className="p-1 rounded-full hover:bg-red-50 group-hover:text-red-500 transition-colors duration-200"
                        aria-label="Supprimer le fichier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {fileStatus.status === FileStatus.PROCESSING && 
                   progress[fileStatus.file.name] !== undefined && (
                    <div className="mt-2">
                      <ProgressBar 
                        value={progress[fileStatus.file.name]} 
                        showLabel 
                        size="sm"
                        variant="info"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="text-xs text-gray-500">{pendingFiles} en attente</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-xs text-gray-500">{completedFiles} terminés</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-xs text-gray-500">{errorFiles} erreurs</span>
              </div>
            </div>
            
            {processedCount.success > 0 || processedCount.error > 0 ? (
              <div className="text-sm">
                <span className="text-gray-600">
                  {processedCount.success} traité{processedCount.success > 1 ? 's' : ''} avec succès
                  {processedCount.error > 0 ? `, ${processedCount.error} en erreur` : ''}
                </span>
              </div>
            ) : null}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={processAllFiles}
              disabled={pendingFiles === 0 || isProcessing}
              variant="primary"
              size="lg"
              className="flex-1"
              loading={isProcessing}
              loadingText="Traitement en cours..."
              iconLeft={<Upload className="h-4 w-4" />}
            >
              Traiter {pendingFiles} {pendingFiles === 1 ? 'fichier' : 'fichiers'}
            </Button>
            
            <Button
              onClick={resetFiles}
              variant="outline"
              size="lg"
              disabled={files.length === 0 || isProcessing}
            >
              Réinitialiser
            </Button>
          </div>
          
          <div className="mt-4 flex items-start">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="ml-2 text-xs text-gray-600">
              Les fichiers seront traités un par un et les certificats générés seront automatiquement téléchargés. 
              Assurez-vous que les fichiers sont correctement formatés selon le modèle requis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiFileUploader;