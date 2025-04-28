// src/pages/CertificateGeneratorPage.tsx
import React, { useState } from 'react';
import { CertificateMode as CertificateModeEnum, ExcelData } from '@/types/certificate';
import certificateService from '@/api/services/certificateService';
import SingleFileUploader from '@/components/certificates/SingleFileUploader';
import CertificateDataPreview from '@/components/certificates/CertificateDataPreview';
import MultiFileUploader from '@/components/certificates/MultiFileUploader';
import HeightWorkFileUploader from '@/components/certificates/HeightWorkFileUploader';
import AppNavigation from '@/components/layout/AppNavigation';
import HelpPanel from '@/components/layout/HelpPanel';
import CertificateMode from '@/components/certificates/CertificateMode';
import {cn} from '@/lib/utils';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

/**
 * Page principale du générateur de certificats
 */
export const CertificateGeneratorPage: React.FC = () => {
  // État de l'application
  const [mode, setMode] = useState<CertificateModeEnum>(CertificateModeEnum.STANDARD);
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Fonction pour afficher une notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    // Fermeture automatique après 5 secondes
    setTimeout(() => setNotification(null), 5000);
  };

  // Gestionnaire de chargement de fichier
  const handleFileLoad = (data: ExcelData, file: File) => {
    setExcelData(data);
    setSelectedFile(file);
  };

  // Gestionnaire de validation (génération de certificats)
  const handleValidate = async () => {
    if (!selectedFile) return;
    
    try {
      setIsLoading(true);
      const blob = await certificateService.generateCertificate(selectedFile);
      certificateService.downloadCertificate(blob, `certificats-${selectedFile.name.split('.')[0]}.zip`);
      showNotification('success', 'Les certificats ont été générés avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('error', 'Une erreur est survenue lors de la génération des certificats.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire de notification de processus de fichiers multiples
  const handleFilesProcessed = (successCount: number, errorCount: number) => {
    if (errorCount === 0) {
      showNotification('success', `${successCount} fichier(s) traité(s) avec succès !`);
    } else {
      showNotification('info', `${successCount} fichier(s) traité(s) avec succès, ${errorCount} en erreur.`);
    }
  };

  // Rendu du mode standard (ATT)
  const renderStandardMode = () => (
    <>
      <SingleFileUploader onFileLoad={handleFileLoad} />
      {excelData && selectedFile && (
        <CertificateDataPreview 
          data={excelData} 
          onValidate={handleValidate}
          isLoading={isLoading}
        />
      )}
    </>
  );

  // Rendu du composant approprié en fonction du mode
  const renderFileUploader = () => {
    switch (mode) {
      case CertificateModeEnum.ELECTRICAL:
        return <MultiFileUploader onFilesProcessed={handleFilesProcessed} />;
      case CertificateModeEnum.HEIGHT_WORK:
        return <HeightWorkFileUploader onFilesProcessed={handleFilesProcessed} />;
      default:
        return renderStandardMode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AppNavigation showHelp={showHelp} setShowHelp={setShowHelp} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showHelp && <HelpPanel />}
        
        {/* Zone de notification */}
        {notification && (
          <div className={cn(
            "mb-6 p-4 rounded-lg flex items-start space-x-3",
            notification.type === 'success' && "bg-green-50 border border-green-200",
            notification.type === 'error' && "bg-red-50 border border-red-200",
            notification.type === 'info' && "bg-blue-50 border border-blue-200"
          )}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />}
            
            <div className="flex-1">
              <p className={cn(
                "text-sm font-medium",
                notification.type === 'success' && "text-green-800",
                notification.type === 'error' && "text-red-800",
                notification.type === 'info' && "text-blue-800"
              )}>
                {notification.message}
              </p>
            </div>
            
            <button 
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <CertificateMode mode={mode} setMode={setMode} />
          
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              {mode === CertificateModeEnum.STANDARD && "Certificat Standard"}
              {mode === CertificateModeEnum.ELECTRICAL && "Habilitation Électrique"}
              {mode === CertificateModeEnum.HEIGHT_WORK && "Travaux en Hauteur"}
            </h2>
            
            {renderFileUploader()}
          </div>
        </div>
      </main>
      

    </div>
  );
};

export default CertificateGeneratorPage;