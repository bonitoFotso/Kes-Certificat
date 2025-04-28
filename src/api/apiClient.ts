// src/api/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants/appConfig';

/**
 * Configuration du client API centralisé
 */
class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 secondes
    });

    // Intercepteur de requête
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Ajout du token d'authentification si disponible
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Gestion globale des erreurs
        if (error.response?.status === 401) {
          // Redirection vers la page de connexion si non authentifié
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Effectue une requête GET
   */
  public async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  /**
   * Effectue une requête POST
   */
  public async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  /**
   * Effectue une requête PUT
   */
  public async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  /**
   * Effectue une requête DELETE
   */
  public async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  /**
   * Permet d'accéder directement à l'instance Axios pour des cas spécifiques
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Exporte une instance singleton du client API
export const apiClient = ApiClient.getInstance();
export default apiClient;