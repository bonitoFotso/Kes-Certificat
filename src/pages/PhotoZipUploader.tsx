import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import apiClient from '@/api/apiClient';

// Types pour les photos sauvegardées
interface SavedPhoto {
  original_name: string;
  saved_name: string;
  path: string;
}

// Types pour la réponse de l'API
interface UploadResponse {
  message: string;
  photos: SavedPhoto[];
}

interface UploadErrorResponse {
  error: string;
}

const PhotoZipUploader: React.FC = () => {
  // States pour gérer l'upload
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestion du changement de fichier
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    
    // Vérifier si c'est un fichier zip
    if (selectedFile && !selectedFile.name.endsWith('.zip')) {
      setUploadError('Veuillez sélectionner un fichier ZIP');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setFile(selectedFile);
    setUploadError(null);
    setUploadSuccess(null);
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!file) {
      setUploadError('Veuillez sélectionner un fichier ZIP');
      return;
    }
    
    const formData = new FormData();
    formData.append('zip_file', file);
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);
    
    try {
      const response = await apiClient.post<UploadResponse>(
        '/upload-photos-zip/', // Remplacez par l'URL de votre API
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        }
      );
      
      setUploadSuccess(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as UploadErrorResponse;
        setUploadError(errorData.error || 'Une erreur est survenue lors de l\'upload');
      } else {
        setUploadError('Une erreur est survenue lors de l\'upload');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Annulation de l'upload
  const handleCancel = () => {
    setFile(null);
    setUploadError(null);
    setUploadSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="photo-zip-uploader">
      <h2>Uploader des photos (fichier ZIP)</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="file-input-container">
          <input
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading}
          />
          {file && (
            <div className="selected-file">
              <span>Fichier sélectionné: {file.name}</span>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isUploading}
                className="cancel-button"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!file || isUploading}
          className="upload-button"
        >
          {isUploading ? 'Envoi en cours...' : 'Uploader les photos'}
        </button>
      </form>
      
      {isUploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span className="progress-text">{uploadProgress}%</span>
        </div>
      )}
      
      {uploadError && (
        <div className="error-message">
          <p>Erreur: {uploadError}</p>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="success-message">
          <h3>{uploadSuccess.message}</h3>
          <h4>Photos enregistrées:</h4>
          <ul className="photo-list">
            {uploadSuccess.photos.map((photo, index) => (
              <li key={index} className="photo-item">
                <p>
                  <strong>Nom original:</strong> {photo.original_name}
                </p>
                <p>
                  <strong>Nom sauvegardé:</strong> {photo.saved_name}
                </p>
                <p>
                  <strong>Chemin:</strong> {photo.path}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <style>{`
        .photo-zip-uploader {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .file-input-container {
          margin-bottom: 15px;
        }
        
        .selected-file {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding: 8px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        
        .cancel-button {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .upload-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .upload-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .progress-container {
          margin-top: 20px;
        }
        
        .progress-bar {
          height: 20px;
          background-color: #e0e0e0;
          border-radius: 4px;
          margin-bottom: 5px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #2196F3;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          font-size: 14px;
        }
        
        .error-message {
          margin-top: 20px;
          padding: 10px;
          background-color: #ffebee;
          color: #d32f2f;
          border-radius: 4px;
        }
        
        .success-message {
          margin-top: 20px;
          padding: 10px;
          background-color: #e8f5e9;
          color: #2e7d32;
          border-radius: 4px;
        }
        
        .photo-list {
          list-style-type: none;
          padding: 0;
        }
        
        .photo-item {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default PhotoZipUploader;