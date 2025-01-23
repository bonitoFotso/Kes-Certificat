import React from 'react';
import type { ExcelData } from '../types';
import { Download, Loader2, AlertCircle } from 'lucide-react';

interface DataPreviewProps {
  data: ExcelData;
  onValidate: () => void;
  isLoading: boolean;
}

export function DataPreview({ data, onValidate, isLoading }: DataPreviewProps) {
  const sheetName = Object.keys(data)[0];
  const sheetData = data[sheetName];

  if (!sheetData?.length) return null;

  const columns = Object.keys(sheetData[0]);
  const totalRows = sheetData.length;

  return (
    <div className="w-full mt-8 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-blue-800">Aperçu des données</h3>
          <p className="mt-1 text-sm text-blue-600">
            Affichage des 5 premières lignes sur {totalRows} au total.
            Vérifiez que les données sont correctes avant de générer les certificats.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" className="px-6 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheetData.slice(0, 5).map((row, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 font-medium text-gray-900">
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onValidate}
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Génération en cours...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Générer les certificats
            </>
          )}
        </button>
      </div>
    </div>
  );
}