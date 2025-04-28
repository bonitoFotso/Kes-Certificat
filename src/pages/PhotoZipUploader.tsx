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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Gestion du changement de fichier
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    validateAndSetFile(selectedFile);
  };

  // Validation du fichier et mise à jour du state
  const validateAndSetFile = (selectedFile: File | null) => {
    // Réinitialiser les états précédents
    setUploadError(null);
    setUploadSuccess(null);
    
    // Vérifier si c'est un fichier zip
    if (selectedFile && !selectedFile.name.toLowerCase().endsWith('.zip')) {
      setUploadError('Veuillez sélectionner un fichier ZIP uniquement');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setFile(selectedFile);
  };

  // Gestion du drag & drop
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  // Simulation de clic sur l'input file
  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
        '/upload-photos-zip/',
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

  // Formatage de la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="photo-zip-uploader">
      <div className="uploader-header">
        <h2>Importer vos photos</h2>
        <p className="subtitle">Téléchargez un fichier ZIP contenant toutes vos photos</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div 
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!file ? triggerFileInput : undefined}
          ref={dropZoneRef}
        >
          <input
            type="file"
            accept=".zip"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading}
            className="file-input"
          />
          
          {!file ? (
            <div className="drop-zone-content">
              <div className="upload-icon">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="upload-text">
                <p><strong>Glissez-déposez</strong> votre fichier ZIP ici ou <strong>cliquez</strong> pour parcourir</p>
                <p className="file-hint">.ZIP uniquement</p>
              </div>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="file-info">
                <p className="file-name" title={file.name}>{file.name}</p>
                <p className="file-meta">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isUploading}
                className="cancel-button"
                aria-label="Annuler"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button
            type="submit"
            disabled={!file || isUploading}
            className="upload-button"
          >
            {isUploading ? 'Envoi en cours...' : 'Importer les photos'}
          </button>
        </div>
      </form>
      
      {isUploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="progress-status">
            <span className="progress-text">{uploadProgress}% terminé</span>
            <span className="progress-label">Traitement en cours...</span>
          </div>
        </div>
      )}
      
      {uploadError && (
        <div className="error-message">
          <div className="message-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p>{uploadError}</p>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="success-message">
          <div className="message-header">
            <div className="message-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18456 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>{uploadSuccess.message}</h3>
          </div>
          
          <div className="photo-results">
            <h4>Photos importées ({uploadSuccess.photos.length})</h4>
            
            <div className="photos-grid">
              {uploadSuccess.photos.map((photo, index) => (
                <div key={index} className="photo-card">
                  <div className="photo-card-header">
                    <div className="photo-number">{index + 1}</div>
                    <div className="photo-original-name" title={photo.original_name}>
                      {photo.original_name}
                    </div>
                  </div>
                  <div className="photo-details">
                    <div className="photo-detail">
                      <div className="detail-label">Nom sauvegardé:</div>
                      <div className="detail-value" title={photo.saved_name}>{photo.saved_name}</div>
                    </div>
                    <div className="photo-detail">
                      <div className="detail-label">Chemin:</div>
                      <div className="detail-value" title={photo.path}>{photo.path}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="new-upload-button"
            onClick={handleCancel}
          >
            Importer d'autres photos
          </button>
        </div>
      )}
      
      <style jsx>{`
        .photo-zip-uploader {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #333;
        }
        
        .uploader-header {
          margin-bottom: 24px;
          text-align: center;
        }
        
        .uploader-header h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a1a1a;
        }
        
        .subtitle {
          color: #666;
          font-size: 16px;
          margin: 0;
        }
        
        .drop-zone {
          border: 2px dashed #ccc;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          margin-bottom: 20px;
          background-color: #f9f9f9;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .drop-zone:hover {
          border-color: #999;
          background-color: #f5f5f5;
        }
        
        .drop-zone.dragging {
          border-color: #2196F3;
          background-color: rgba(33, 150, 243, 0.05);
        }
        
        .drop-zone.has-file {
          cursor: default;
          padding: 20px;
          border-style: solid;
          border-color: #e0e0e0;
          background-color: #fff;
        }
        
        .file-input {
          display: none;
        }
        
        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        
        .upload-icon {
          color: #888;
          margin-bottom: 8px;
        }
        
        .upload-text {
          font-size: 16px;
          color: #666;
        }
        
        .upload-text p {
          margin: 4px 0;
        }
        
        .file-hint {
          font-size: 14px;
          color: #888;
          margin-top: 8px;
        }
        
        .file-preview {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 8px;
        }
        
        .file-icon {
          flex-shrink: 0;
          color: #2196F3;
        }
        
        .file-info {
          flex-grow: 1;
          overflow: hidden;
          text-align: left;
        }
        
        .file-name {
          margin: 0;
          font-weight: 500;
          font-size: 16px;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .file-meta {
          margin: 4px 0 0;
          font-size: 14px;
          color: #777;
        }
        
        .cancel-button {
          background-color: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .cancel-button:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: #555;
        }
        
        .cancel-button:disabled {
          color: #ccc;
          cursor: not-allowed;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        
        .upload-button {
          background-color: #2196F3;
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 200px;
        }
        
        .upload-button:hover {
          background-color: #1976D2;
        }
        
        .upload-button:disabled {
          background-color: #B0BEC5;
          cursor: not-allowed;
        }
        
        .progress-container {
          margin: 16px 0 24px;
          padding: 16px;
          background-color: #f5f5f5;
          border-radius: 8px;
        }
        
        .progress-bar {
          height: 8px;
          background-color: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #2196F3;
          transition: width 0.3s ease;
        }
        
        .progress-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .progress-text {
          font-size: 14px;
          font-weight: 500;
          color: #2196F3;
        }
        
        .progress-label {
          font-size: 14px;
          color: #757575;
        }
        
        .message-icon {
          display: flex;
          align-items: center;
          margin-right: 12px;
        }
        
        .error-message {
          display: flex;
          align-items: flex-start;
          margin: 20px 0;
          padding: 16px;
          background-color: #FFF5F5;
          border-left: 4px solid #F44336;
          border-radius: 4px;
          color: #E53935;
        }
        
        .error-message p {
          margin: 0;
        }
        
        .success-message {
          margin: 24px 0;
          padding: 24px;
          background-color: #F1F8E9;
          border-radius: 8px;
          color: #2E7D32;
        }
        
        .message-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .message-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 500;
        }
        
        .photo-results {
          margin-top: 24px;
        }
        
        .photo-results h4 {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }
        
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .photo-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }
        
        .photo-card-header {
          display: flex;
          align-items: center;
          padding: 12px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .photo-number {
          background-color: #2196F3;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .photo-original-name {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #333;
        }
        
        .photo-details {
          padding: 12px;
        }
        
        .photo-detail {
          margin-bottom: 8px;
        }
        
        .photo-detail:last-child {
          margin-bottom: 0;
        }
        
        .detail-label {
          font-size: 12px;
          color: #757575;
          margin-bottom: 2px;
        }
        
        .detail-value {
          font-size: 13px;
          word-break: break-all;
          color: #333;
        }
        
        .new-upload-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: block;
          margin: 0 auto;
        }
        
        .new-upload-button:hover {
          background-color: #388E3C;
        }
        
        @media (max-width: 768px) {
          .photos-grid {
            grid-template-columns: 1fr;
          }
          
          .drop-zone {
            padding: 20px 10px;
          }
          
          .upload-text {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoZipUploader;