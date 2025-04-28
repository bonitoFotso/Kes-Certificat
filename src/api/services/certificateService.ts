// src/api/services/certificateService.ts
import apiClient from '../apiClient';
import { API_ENDPOINTS } from '../endpoints';
import { CertificateGenerationResponse, FileUploadProgressCallback } from './types';

/**
 * Service gérant toutes les opérations API liées aux certificats
 */
export const certificateService = {
  /**
   * Génère un certificat standard (ATT)
   */
  generateCertificate: async (file: File): Promise<Blob> => {
    const formData = new FormData();
    formData.append('excel_file', file);

    const response = await apiClient.post(
      API_ENDPOINTS.CERTIFICATES.GENERATE,
      formData,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data as Blob;
  },

  /**
   * Génère un certificat d'habilitation électrique (THEL)
   */
  generateElectricalCertificate: async (
    file: File, 
    onProgress?: FileUploadProgressCallback
  ): Promise<CertificateGenerationResponse> => {
    const formData = new FormData();
    formData.append('excel_file', file);

    const response = await apiClient.post(
      API_ENDPOINTS.CERTIFICATES.ELECTRICAL_CERTIFICATION,
      formData,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(file.name, percentCompleted);
          }
        }
      }
    );

    return {
      data: response.data as Blob,
      filename: `certificats-${file.name.split('.')[0]}.zip`,
      contentType: response.headers['content-type'] || 'application/zip'
    };
  },

  /**
   * Génère un certificat de travaux en hauteur (THTH)
   */
  generateHeightWorkCertificate: async (
    file: File, 
    onProgress?: FileUploadProgressCallback
  ): Promise<CertificateGenerationResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      API_ENDPOINTS.CERTIFICATES.HEIGHT_WORK_CERTIFICATION,
      formData,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(file.name, percentCompleted);
          }
        }
      }
    );

    return {
      data: response.data as Blob,
      filename: `certificats-${file.name.split('.')[0]}.zip`,
      contentType: response.headers['content-type'] || 'application/zip'
    };
  },

  /**
   * Télécharge un certificat généré
   */
  downloadCertificate: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};

export default certificateService;