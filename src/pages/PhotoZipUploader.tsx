import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import apiClient from '@/api/apiClient';

// Types pour les photos sauvegardées
interface SavedPhoto {
  original_name: string;
  saved_name: string;
  path: string;
}

// Type pour les références
interface Reference {
  photo_count: number;
  has_logo: boolean;
}

// Types pour la réponse de l'API
interface UploadResponse {
  message: string;
  photos?: SavedPhoto[];
  project_name: string;
  references: {
    [key: string]: Reference;
  };
  total_photos: number;
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
          
          <div className="project-info">
            <div className="info-card">
              <div className="info-label">Nom du projet:</div>
              <div className="info-value">{uploadSuccess.project_name}</div>
            </div>
            
            <div className="info-card">
              <div className="info-label">Total des photos:</div>
              <div className="info-value">{uploadSuccess.total_photos}</div>
            </div>
          </div>
          
          <div className="references-section">
            <h4>Références</h4>
            <div className="references-grid">
              {Object.entries(uploadSuccess.references).map(([refId, refData], index) => (
                <div key={index} className="reference-card">
                  <div className="reference-header">
                    <div className="reference-id">{refId}</div>
                    {refData.has_logo && (
                      <div className="reference-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Logo
                      </div>
                    )}
                  </div>
                  <div className="reference-details">
                    <div className="reference-detail">
                      <div className="detail-label">Nombre de photos:</div>
                      <div className="detail-value">{refData.photo_count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {uploadSuccess.photos && uploadSuccess.photos.length > 0 && (
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
          )}
          
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
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        
        .uploader-header {
          margin-bottom: 24px;
          text-align: center;
        }
        
        .uploader-header h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }
        
        .subtitle {
          font-size: 16px;
          color: #666;
        }
        
        .drop-zone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #f9f9f9;
          position: relative;
          margin-bottom: 20px;
        }
        
        .drop-zone.dragging {
          border-color: #4a90e2;
          background-color: #f0f7ff;
        }
        
        .drop-zone.has-file {
          padding: 20px;
          background-color: #f5f5f5;
        }
        
        .file-input {
          position: absolute;
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          z-index: -1;
        }
        
        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .upload-icon {
          margin-bottom: 16px;
          color: #666;
        }
        
        .upload-text p {
          margin: 0 0 8px;
          color: #555;
          font-size: 16px;
        }
        
        .file-hint {
          font-size: 14px;
          color: #888;
        }
        
        .file-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: white;
          border-radius: 6px;
          padding: 12px 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .file-icon {
          margin-right: 12px;
          color: #4a90e2;
        }
        
        .file-info {
          flex: 1;
        }
        
        .file-name {
          font-weight: 500;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 400px;
          color: #333;
        }
        
        .file-meta {
          font-size: 14px;
          color: #888;
          margin: 0;
        }
        
        .cancel-button {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .cancel-button:hover {
          background-color: #f1f1f1;
          color: #555;
        }
        
        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
          margin-top: 16px;
        }
        
        .upload-button {
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 200px;
        }
        
        .upload-button:hover {
          background-color: #3a80d2;
        }
        
        .upload-button:disabled {
          background-color: #a0c3e8;
          cursor: not-allowed;
        }
        
        .progress-container {
          margin-top: 24px;
          background-color: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .progress-bar {
          height: 8px;
          background-color: #eee;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #4a90e2;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }
        
        .progress-text {
          font-weight: 500;
          color: #333;
        }
        
        .progress-label {
          color: #888;
        }
        
        .error-message, .success-message {
          margin-top: 24px;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        
        .error-message {
          background-color: #fff4f4;
          border-left: 5px solid #e74c3c;
          display: flex;
          align-items: flex-start;
        }
        
        .error-message .message-icon {
          margin-right: 12px;
          color: #e74c3c;
          flex-shrink: 0;
        }
        
        .error-message p {
          margin: 0;
          color: #d44;
        }
        
        .success-message {
          background-color: #f4fff4;
          border-left: 5px solid #2ecc71;
        }
        
        .message-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .message-header .message-icon {
          margin-right: 12px;
          color: #2ecc71;
          flex-shrink: 0;
        }
        
        .message-header h3 {
          margin: 0;
          color: #2a9d60;
          font-size: 18px;
          font-weight: 600;
        }
        
        .project-info {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .info-card {
          background-color: white;
          border-radius: 6px;
          padding: 12px 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          min-width: 200px;
          flex: 1;
        }
        
        .info-label {
          font-size: 14px;
          color: #777;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        
        .references-section, .photo-results {
          margin-top: 32px;
        }
        
        .references-section h4, .photo-results h4 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #444;
        }
        
        .references-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .reference-card {
          background-color: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }
        
        .reference-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .reference-id {
          font-size: 16px;
          font-weight: 600;
          color: #4a90e2;
        }
        
        .reference-badge {
          display: flex;
          align-items: center;
          background-color: #f0f7ff;
          border-radius: 16px;
          padding: 4px 8px;
          font-size: 12px;
          color: #4a90e2;
        }
        
        .reference-badge svg {
          margin-right: 4px;
        }
        
        .reference-details {
          padding-top: 8px;
        }
        
        .reference-detail {
          display: flex;
          margin-bottom: 4px;
        }
        
        .reference-detail .detail-label {
          font-size: 14px;
          color: #777;
          min-width: 120px;
          margin-right: 8px;
        }
        
        .reference-detail .detail-value {
          font-size: 14px;
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
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }
        
        .photo-card-header {
          background-color: #f5f5f5;
          padding: 12px 16px;
          display: flex;
          align-items: center;
        }
        
        .photo-number {
          background-color: #4a90e2;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-right: 12px;
        }
        
        .photo-original-name {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #555;
        }
        
        .photo-details {
          padding: 16px;
        }
        
        .photo-detail {
          margin-bottom: 12px;
        }
        
        .photo-detail:last-child {
          margin-bottom: 0;
        }
        
        .photo-detail .detail-label {
          font-size: 13px;
          color: #777;
          margin-bottom: 4px;
        }
        
        .photo-detail .detail-value {
          font-size: 14px;
          color: #333;
          word-break: break-all;
        }
        
        .new-upload-button {
          background-color: #f9f9f9;
          color: #4a90e2;
          border: 1px solid #4a90e2;
          border-radius: 6px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
          width: 100%;
        }
        
        .new-upload-button:hover {
          background-color: #f0f7ff;
          color: #3a80d2;
          border-color: #3a80d2;
        }
        
        @media (max-width: 640px) {
          .project-info {
            flex-direction: column;
          }
          
          .references-grid, .photos-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoZipUploader;