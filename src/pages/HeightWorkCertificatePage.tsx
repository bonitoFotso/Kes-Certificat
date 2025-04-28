// src/pages/certificates/HeightWorkCertificatePage.tsx
import React from 'react';
import HeightWorkFileUploader from '@/components/certificates/HeightWorkFileUploader';

interface HeightWorkCertificatePageProps {
  onFilesProcessed: (successCount: number, errorCount: number) => void;
}

/**
 * Page pour générer des certificats de travaux en hauteur
 */
const HeightWorkCertificatePage: React.FC<HeightWorkCertificatePageProps> = ({ onFilesProcessed }) => {
  return (
    <div>
      <HeightWorkFileUploader onFilesProcessed={onFilesProcessed} />
    </div>
  );
};

export default HeightWorkCertificatePage;