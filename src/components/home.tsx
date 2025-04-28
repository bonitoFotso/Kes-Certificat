import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { read, utils } from 'xlsx';
import { ExcelData } from '@/types/certificate';

interface FileUploaderProps {
  onFileLoad: (data: ExcelData, file: File) => void;
}

export function FileUploaderTHTH({ onFileLoad }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      const workbook = read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet) as Record<string, unknown>[];
      
      onFileLoad({ [sheetName]: jsonData }, file);
    };
    reader.readAsArrayBuffer(file);
  }, [onFileLoad]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || !file.name.match(/\.(xlsx|xls)$/)) {
      alert('Veuillez déposer un fichier Excel valide (.xlsx ou .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      const workbook = read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet) as Record<string, unknown>[];
      
      onFileLoad({ [sheetName]: jsonData }, file);
    };
    reader.readAsArrayBuffer(file);
  }, [onFileLoad]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label 
        htmlFor="file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
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
              {isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier Excel'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              ou <span className="text-blue-500 hover:text-blue-600">parcourez</span> vos fichiers
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Formats acceptés : .xlsx
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".xlsx"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
}