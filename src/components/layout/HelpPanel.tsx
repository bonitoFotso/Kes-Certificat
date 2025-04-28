// src/components/layout/HelpPanel.tsx
import React from 'react';
import { 
  FileSpreadsheet, 
  Files, 
  HardHat, 
  Info, 
  FileCheck, 
  AlertTriangle, 
  ExternalLink 
} from 'lucide-react';

/**
 * Section d'aide expliquant l'utilisation de l'application
 */
export const HelpPanel: React.FC = () => {
  return (
    <div className="mb-8 bg-white rounded-xl shadow-md border-l-4 border-blue-500 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Info className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-900">Guide d'utilisation de l'application</h2>
            <p className="mt-1 text-gray-600">
              Cette application vous permet de générer différents types de certificats à partir de fichiers Excel.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 py-4">
        <h3 className="text-base font-medium text-gray-900">Modes de génération disponibles</h3>
        
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Mode standard */}
          <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 rounded-md bg-blue-50">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                </div>
                <h4 className="ml-3 text-sm font-medium text-gray-900">Certificat Standard</h4>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600">
                  Idéal pour traiter un seul fichier Excel. Vous pourrez prévisualiser les données avant de générer les certificats.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Habilitation Électrique */}
          <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 rounded-md bg-blue-50">
                  <Files className="h-5 w-5 text-blue-500" />
                </div>
                <h4 className="ml-3 text-sm font-medium text-gray-900">Habilitation Électrique</h4>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600">
                  Permet de générer des titres d'habilitation électrique. Supportant plusieurs fichiers en traitement par lots.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Travaux en Hauteur */}
          <div className="bg-white overflow-hidden rounded-lg border border-gray-200">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-2 rounded-md bg-blue-50">
                  <HardHat className="h-5 w-5 text-blue-500" />
                </div>
                <h4 className="ml-3 text-sm font-medium text-gray-900">Travaux en Hauteur</h4>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600">
                  Génère des certificats d'habilitation pour les travaux en hauteur avec suivi de progression détaillé.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 px-6 py-4">
        <h3 className="text-base font-medium text-gray-900">Étapes de génération</h3>
        
        <ol className="mt-4 space-y-3">
          <li className="flex items-start">
            <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
              1
            </div>
            <p className="ml-3 text-sm text-gray-600">
              <span className="font-medium text-gray-900">Sélection du mode</span>
              {" — "}
              Choisissez le type de certificat à générer selon vos besoins.
            </p>
          </li>
          
          <li className="flex items-start">
            <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
              2
            </div>
            <p className="ml-3 text-sm text-gray-600">
              <span className="font-medium text-gray-900">Téléchargement de fichier(s)</span>
              {" — "}
              Glissez-déposez ou sélectionnez un ou plusieurs fichiers Excel à traiter.
            </p>
          </li>
          
          <li className="flex items-start">
            <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
              3
            </div>
            <p className="ml-3 text-sm text-gray-600">
              <span className="font-medium text-gray-900">Vérification</span>
              {" — "}
              Vérifiez que les données sont correctes avant de lancer la génération.
            </p>
          </li>
          
          <li className="flex items-start">
            <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
              4
            </div>
            <p className="ml-3 text-sm text-gray-600">
              <span className="font-medium text-gray-900">Génération</span>
              {" — "}
              Lancez la génération des certificats. Les fichiers seront téléchargés automatiquement.
            </p>
          </li>
        </ol>
      </div>

      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-start space-x-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center mb-2">
              <FileCheck className="h-5 w-5 text-green-500" />
              <h4 className="ml-2 text-sm font-medium text-gray-900">Formats acceptés</h4>
            </div>
            <p className="text-xs text-gray-600">
              Fichiers Excel (.xlsx, .xls)
            </p>
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h4 className="ml-2 text-sm font-medium text-gray-900">Remarques importantes</h4>
            </div>
            <p className="text-xs text-gray-600">
              Les fichiers doivent être correctement formatés selon le modèle établi pour chaque type de certificat.
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <a
            href="#"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Télécharger les modèles de fichiers
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;