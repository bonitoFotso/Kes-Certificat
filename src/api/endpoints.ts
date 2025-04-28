// src/api/endpoints.ts

/**
 * Points de terminaison de l'API centralisés
 * Cela permet de gérer plus facilement les changements d'URL
 */
export const API_ENDPOINTS = {
    CERTIFICATES: {
      GENERATE: '/certificat/',
      ELECTRICAL_CERTIFICATION: '/generate-habilitation/',
      HEIGHT_WORK_CERTIFICATION: '/traveaux_hauteur/'
    },
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh'
    },
    USERS: {
      PROFILE: '/users/profile',
      UPDATE: '/users/update'
    }
  };
  
  export default API_ENDPOINTS;