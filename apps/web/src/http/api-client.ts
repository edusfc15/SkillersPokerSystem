import ky from 'ky';
import { API_CONFIG, isDevelopment } from './config';

// Instância principal do Ky com configurações padrão
export const apiClient = ky.create({
  prefixUrl: API_CONFIG.BASE_URL,
  headers: API_CONFIG.DEFAULT_HEADERS,
  timeout: API_CONFIG.DEFAULT_TIMEOUT,
  retry: API_CONFIG.RETRY_CONFIG,
  hooks: {
    beforeRequest: [
      (request) => {
        // Adiciona token de autenticação se disponível
        const token = localStorage.getItem("skillers-auth-token");
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        // Log de debug para development
        if (isDevelopment()) {
          console.log(`${_request.method} ${response.url} - ${response.status}`);
        }
        return response;
      },
    ],
    beforeError: [
      (error) => {
        // Log de erros para debug
        if (isDevelopment()) {
          console.error('API Error:', error);
        }
        return error;
      },
    ],
  },
});

// Cliente para requisições que não precisam de autenticação
export const publicApiClient = ky.create({
  prefixUrl: API_CONFIG.BASE_URL,
  headers: API_CONFIG.DEFAULT_HEADERS,
  timeout: API_CONFIG.DEFAULT_TIMEOUT,
  retry: API_CONFIG.RETRY_CONFIG,
});

// Tipos para respostas da API
export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
  details?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Helper para extrair erros da API
export const extractApiError = async (error: unknown): Promise<string> => {
  if (error && typeof error === 'object' && 'response' in error) {
    try {
      const response = error.response as Response;
      const errorData: ApiErrorResponse = await response.json();
      
      // Se tem detalhes de validação, retorna as mensagens formatadas
      if (errorData.details && errorData.details.length > 0) {
        return errorData.details.map(detail => detail.message).join(', ');
      }
      
      // Senão, retorna a mensagem principal
      return errorData.message || 'Erro desconhecido';
    } catch {
      return 'Erro ao processar resposta da API';
    }
  }
  
  return error instanceof Error ? error.message : 'Erro desconhecido';
};
