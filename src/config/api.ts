// Configuração da API para diferentes ambientes
const isDevelopment = import.meta.env.DEV;

// URL da API - em desenvolvimento usa localhost, em produção usa a URL do backend hospedado
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : import.meta.env.VITE_API_URL || 'https://seu-backend-url.vercel.app';

// Configuração padrão para requisições
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Função para fazer requisições autenticadas
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  return fetch(`${API_BASE_URL}${url}`, config);
}; 