// Configurações da API
export const API_CONFIG = {
  // URL base da API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // Timeout padrão para requisições (em milissegundos)
  DEFAULT_TIMEOUT: 30000,
  
  // Configurações de retry
  RETRY_CONFIG: {
    limit: 2,
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Chaves do localStorage
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_DATA: 'userData',
  },
};

// Função para verificar se estamos em desenvolvimento
export const isDevelopment = () => import.meta.env.DEV;

// Função para verificar se estamos em produção
export const isProduction = () => import.meta.env.PROD;
