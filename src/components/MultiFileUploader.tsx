import React, { useCallback, useState } from 'react';
import { Upload, Trash2, FileSpreadsheet, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { ExcelData } from '@/types/certificate';

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  data?: ExcelData;
  error?: string;
}

export function MultiFileUploader() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [currentProcessing, setCurrentProcessing] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let newFiles: File[];
    
    if ('dataTransfer' in event) {
      newFiles = Array.from(event.dataTransfer.files);
    } else {
      newFiles = Array.from(event.target.files || []);
    }

    // Filtrer les fichiers Excel
    const excelFiles = newFiles.filter(file => 
      file.name.match(/\.(xlsx|xls)$/)
    );

    if (excelFiles.length !== newFiles.length) {
      alert('Certains fichiers ont été ignorés car ils ne sont pas au format Excel (.xlsx ou .xls)');
    }

    setFiles(prev => [
      ...prev,
      ...excelFiles.map(file => ({ file, status: 'pending' as const }))
    ]);

    if ('target' in event) {
      (event.target as HTMLInputElement).value = '';
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processAllFiles = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        setCurrentProcessing(i);
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'processing' } : f
        ));

        try {
          const formData = new FormData();
          formData.append('file', files[i].file);
          
          const response = await fetch('http://192.168.100.188:8889/api/generate-habilitation/', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Erreur serveur');

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `certificats-${files[i].file.name.split('.')[0]}.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'completed' } : f
          ));
        } catch (error) {
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { 
              ...f, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Erreur inconnue'
            } : f
          ));
        }
      }
    }
    setCurrentProcessing(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e);
  };

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'pending':
        return <FileSpreadsheet className="w-5 h-5 text-gray-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const pendingFiles = files.filter(f => f.status === 'pending').length;
  const completedFiles = files.filter(f => f.status === 'completed').length;
  const errorFiles = files.filter(f => f.status === 'error').length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <label 
        htmlFor="multi-file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${
            isDragging ? 'bg-blue-100' : 'bg-white'
          }`}>
            {isDragging ? (
              <FileSpreadsheet className="w-12 h-12 text-blue-500" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              {isDragging ? 'Déposez les fichiers ici' : 'Glissez-déposez vos fichiers Excel'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              ou <span className="text-blue-500 hover:text-blue-600">parcourez</span> vos fichiers
            </p>
          </div>
        </div>
        <input
          id="multi-file-upload"
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          multiple
        />
      </label>

      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Fichiers ({files.length})
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-500">{pendingFiles} en attente</span>
                <span className="text-green-500">{completedFiles} complétés</span>
                <span className="text-red-500">{errorFiles} erreurs</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {files.map((file, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(file.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.file.name}
                      </p>
                      {file.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {file.error}
                        </p>
                      )}
                    </div>
                  </div>
                  {file.status === 'pending' && (
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pendingFiles > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>Les fichiers seront traités un par un</span>
                </div>
                <button
                  onClick={processAllFiles}
                  disabled={currentProcessing !== null}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {currentProcessing !== null ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Traiter les fichiers
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}