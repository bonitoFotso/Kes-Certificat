// src/components/certificates/CertificateDataPreview.tsx
import React, { useMemo, useState } from 'react';
import { Download, AlertCircle, Filter, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { DataPreviewProps } from '../../types/certificate';
import Button from '../common/Button';

/**
 * Composant pour prévisualiser les données avant génération de certificats
 */
export const CertificateDataPreview: React.FC<DataPreviewProps> = ({ 
  data, 
  onValidate, 
  isLoading 
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 5;

  // Récupérer le nom de la première feuille et les données
  const sheetName = Object.keys(data)[0];
  const sheetData = useMemo(() => data[sheetName] || [], [data, sheetName]);

  // Nombre total de lignes
  const totalRows = sheetData.length;

  // Colonnes du tableau
  const columns = useMemo(() => {
    if (sheetData.length === 0) return [];
    return Object.keys(sheetData[0]);
  }, [sheetData]);

  // Fonction de tri des données
  const sortedData = useMemo(() => {
    if (!sortColumn) return sheetData;

    return [...sheetData].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      // Déterminer le type de données
      const isNumericA = !isNaN(Number(valueA));
      const isNumericB = !isNaN(Number(valueB));

      // Si les deux sont numériques, trier numériquement
      if (isNumericA && isNumericB) {
        return sortDirection === 'asc' 
          ? Number(valueA) - Number(valueB) 
          : Number(valueB) - Number(valueA);
      }

      // Sinon, convertir en chaînes et trier
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();

      if (sortDirection === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  }, [sheetData, sortColumn, sortDirection]);

  // Filtre des données
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return sortedData;

    const searchLower = searchTerm.toLowerCase();
    return sortedData.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }, [sortedData, searchTerm]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Gestionnaire de tri
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Total des pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  if (!sheetData.length) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-500" />
          <p className="text-yellow-700">Aucune donnée disponible pour la prévisualisation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8 space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-blue-800">Aperçu des données</h3>
          <p className="mt-1 text-sm text-blue-600">
            Affichage de {filteredData.length > 0 ? paginatedData.length : 0} ligne(s) sur {totalRows} au total.
            Vérifiez que les données sont correctes avant de générer les certificats.
          </p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Réinitialiser à la première page lors de la recherche
            }}
          />
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredData.length} résultat(s) sur {totalRows}
        </div>
      </div>

      {/* Tableau des données */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column} 
                  scope="col" 
                  className="px-6 py-3 font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column}</span>
                    <div className="flex flex-col">
                      {sortColumn === column ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-3 h-3 text-blue-500" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-blue-500" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column}`} className="px-6 py-4 font-medium text-gray-900">
                    {String(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Page {page} sur {totalPages}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
      
      {/* Bouton de génération */}
      <div className="flex justify-end">
        <Button
          onClick={onValidate}
          disabled={isLoading || filteredData.length === 0}
          variant="primary"
          size="lg"
          loading={isLoading}
          loadingText="Génération en cours..."
          iconLeft={<Download className="w-5 h-5" />}
        >
          Générer les certificats
        </Button>
      </div>
    </div>
  );
};

export default CertificateDataPreview;