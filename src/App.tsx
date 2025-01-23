import { FileUploader } from './components/FileUploader';
import { DataPreview } from './components/DataPreview';
import { MultiFileUploader } from './components/MultiFileUploader';
import type { ExcelData } from './types';
import { FileSpreadsheet, Files, HelpCircle } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleFileLoad = (data: ExcelData, file: File) => {
    setExcelData(data);
    setSelectedFile(file);
  };

  const handleValidate = async () => {
    if (!selectedFile) return;
    
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('excel_file', selectedFile);
      
      const response = await fetch('http://127.0.0.1:8001/api/certificat/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération des certificats');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificats-${selectedFile.name.split('.')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la génération des certificats.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Générateur de Certificats
              </h1>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              aria-label="Aide"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showHelp && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comment utiliser l'application ?</h2>
            <div className="space-y-3 text-gray-600">
              <p><strong>Mode fichier unique :</strong> Idéal pour traiter un seul fichier Excel. Vous pourrez prévisualiser les données avant de générer les certificats.</p>
              <p><strong>Mode multi-fichiers :</strong> Permet de traiter plusieurs fichiers Excel en une fois. Chaque fichier sera traité séquentiellement.</p>
              <p><strong>Format accepté :</strong> Fichiers Excel (.xlsx, .xls)</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setMode('single')}
                className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  mode === 'single'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Fichier unique
              </button>
              <button
                onClick={() => setMode('multi')}
                className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition-all duration-200 ${
                  mode === 'multi'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Files className="w-4 h-4" />
                Plusieurs fichiers
              </button>
            </div>
          </div>

          {mode === 'single' ? (
            <>
              <FileUploader onFileLoad={handleFileLoad} />
              {excelData && selectedFile && (
                <DataPreview 
                  data={excelData} 
                  onValidate={handleValidate}
                  isLoading={isLoading}
                />
              )}
            </>
          ) : (
            <MultiFileUploader />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;