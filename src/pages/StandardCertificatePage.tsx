// src/pages/certificates/StandardCertificatePage.tsx
import React, { useState } from 'react';
import { ExcelData } from '@/types/certificate';
import certificateService from '@/api/services/certificateService';
import SingleFileUploader from '@/components/certificates/SingleFileUploader';
import CertificateDataPreview from '@/components/certificates/CertificateDataPreview';

interface StandardCertificatePageProps {
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

/**
 * Page pour générer des certificats standards
 */
const StandardCertificatePage: React.FC<StandardCertificatePageProps> = ({ showNotification }) => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  return (
    <div>
      <SingleFileUploader onFileLoad={handleFileLoad} />
      {excelData && selectedFile && (
        <CertificateDataPreview 
          data={excelData} 
          onValidate={handleValidate}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default StandardCertificatePage;