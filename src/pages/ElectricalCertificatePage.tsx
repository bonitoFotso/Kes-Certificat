// src/pages/certificates/ElectricalCertificatePage.tsx
import React from 'react';
import MultiFileUploader from '@/components/certificates/MultiFileUploader';

interface ElectricalCertificatePageProps {
  onFilesProcessed: (successCount: number, errorCount: number) => void;
}

/**
 * Page pour générer des certificats d'habilitation électrique
 */
const ElectricalCertificatePage: React.FC<ElectricalCertificatePageProps> = ({ onFilesProcessed }) => {
  return (
    <div>
      <MultiFileUploader onFilesProcessed={onFilesProcessed} />
    </div>
  );
};

export default ElectricalCertificatePage;