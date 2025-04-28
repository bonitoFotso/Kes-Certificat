// src/components/certificates/CertificateMode.tsx
import React from 'react';
import { FileSpreadsheet, Files, HardHat } from 'lucide-react';
import { CertificateMode as CertificateModeEnum, CertificateModeProps } from '../../types/certificate';
import {cn} from '@/lib/utils';

/**
 * Composant pour sélectionner le mode de certificat
 */
export const CertificateMode: React.FC<CertificateModeProps> = ({ 
  mode, 
  setMode 
}) => {
  // Définition des modes disponibles
  const modes = [
    {
      id: CertificateModeEnum.STANDARD,
      label: 'Certificat Standard',
      icon: FileSpreadsheet,
      description: 'Générer des certificats à partir d\'un fichier Excel'
    },
    {
      id: CertificateModeEnum.ELECTRICAL,
      label: 'Habilitation Électrique',
      icon: Files,
      description: 'Générer des titres d\'habilitation électrique'
    },
    {
      id: CertificateModeEnum.HEIGHT_WORK,
      label: 'Travaux en Hauteur',
      icon: HardHat,
      description: 'Générer des titres d\'habilitation pour travaux en hauteur'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Sélectionner un type de certificat</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modes.map((modeOption) => {
          const Icon = modeOption.icon;
          const isActive = mode === modeOption.id;
          
          return (
            <button
              key={modeOption.id}
              onClick={() => setMode(modeOption.id)}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                isActive
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "p-3 rounded-full mb-3",
                isActive ? "bg-blue-100" : "bg-gray-100"
              )}>
                <Icon 
                  className={cn(
                    "w-6 h-6",
                    isActive ? "text-blue-600" : "text-gray-600"
                  )} 
                />
              </div>
              
              <div className="text-center">
                <h3 className={cn(
                  "font-medium mb-1",
                  isActive ? "text-blue-700" : "text-gray-800"
                )}>
                  {modeOption.label}
                </h3>
                <p className="text-xs text-gray-500">
                  {modeOption.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CertificateMode;