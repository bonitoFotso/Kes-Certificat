// src/components/common/FileUploader.tsx
import { forwardRef, useId } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { ACCEPTED_FILE_TYPES } from '../../constants/appConfig';
import { ExcelData } from '../../types/certificate';
import  {cn}  from '@/lib/utils';

interface FileUploaderProps {
  onFileLoad?: (data: ExcelData, file: File) => void;
  accept?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
  subLabel?: string;
  helpText?: string;
}

export const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>((props, ref) => {
  const {
    onFileLoad,
    accept = ACCEPTED_FILE_TYPES.EXCEL,
    multiple = false,
    maxFiles = 1,
    maxSize,
    className,
    disabled = false,
    label = 'Glissez-déposez votre fichier Excel',
    subLabel = 'ou parcourez vos fichiers',
    helpText = 'Formats acceptés : .xlsx, .xls'
  } = props;

  const id = useId();
  const inputId = `file-upload-${id}`;

  const {
    isDragging,
    error,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInput
  } = useFileUpload({
    maxFiles,
    maxFileSize: maxSize,
    acceptedFileTypes: accept,
    onFileRead: onFileLoad
  });

  const acceptString = accept.join(',');

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200",
          isDragging 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 bg-gray-50 hover:bg-gray-100",
          disabled && "opacity-60 cursor-not-allowed bg-gray-100",
          className
        )}
        onDragEnter={disabled ? undefined : handleDragEnter}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDragOver={disabled ? undefined : handleDragOver}
        onDrop={disabled ? undefined : handleDrop}
      >
        <label 
          htmlFor={inputId}
          className={cn(
            "flex flex-col items-center justify-center h-full w-full cursor-pointer",
            disabled && "cursor-not-allowed"
          )}
        >
          <div className="flex flex-col items-center justify-center space-y-4 p-6">
            <div className={cn(
              "p-4 rounded-full",
              isDragging ? "bg-blue-100" : "bg-white"
            )}>
              {isDragging ? (
                <FileSpreadsheet className="w-12 h-12 text-blue-500" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                {isDragging ? 'Déposez le fichier ici' : label}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {!disabled && (
                  <>
                    {subLabel.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="text-blue-500 hover:text-blue-600">
                      {subLabel.split(' ').slice(-1)[0]}
                    </span>
                  </>
                )}
              </p>
            </div>

            <p className="text-xs text-gray-400">
              {helpText}
            </p>
          </div>
        </label>

        <input
          ref={ref}
          id={inputId}
          type="file"
          className="hidden"
          accept={acceptString}
          onChange={handleFileInput}
          multiple={multiple}
          disabled={disabled}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
});

FileUploader.displayName = 'FileUploader';

export default FileUploader;