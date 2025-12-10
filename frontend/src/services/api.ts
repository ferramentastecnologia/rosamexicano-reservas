import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Criar instância do Axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token no header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para renovar token se expirado
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Se erro 401 (Unauthorized) e ainda não foi tentado refresh
    if (error.response?.status === 401 && !originalRequest?.headers?.['X-Retry-Count']) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // Sem refresh token, fazer logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/admin';
          return Promise.reject(error);
        }

        // Tentar renovar token
        const response = await axios.post(`${API_URL}/admin/refresh`, {
          refresh_token: refreshToken,
        });

        if (response.data.access_token) {
          localStorage.setItem('authToken', response.data.access_token);

          // Repetir a requisição original com o novo token
          if (originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            originalRequest.headers['X-Retry-Count'] = '1';
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Falha ao renovar token
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/admin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Funções de API

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/admin/login', { email, password }),

  refresh: (refreshToken: string) =>
    api.post('/admin/refresh', { refresh_token: refreshToken }),

  profile: () =>
    api.get('/admin/profile'),
};

// Payments
export const paymentAPI = {
  create: (data: {
    nome: string;
    email: string;
    telefone: string;
    data: string;
    horario: string;
    numero_pessoas: number;
    mesas_selecionadas: string;
  }) =>
    api.post('/payments/create', data),

  checkStatus: (paymentId: string) =>
    api.get(`/payments/${paymentId}/status`),

  checkAvailability: (data: {
    data: string;
    horario: string;
    numero_pessoas: number;
  }) =>
    api.post('/payments/check-availability', data),

  getAvailableTables: (data: {
    data: string;
    horario: string;
    numero_pessoas: number;
  }) =>
    api.post('/tables/available', data),
};

// Reservations
export const reservationAPI = {
  list: (status?: string, limit: number = 20, offset: number = 0) =>
    api.get('/admin/reservations', {
      params: { status, limit, offset },
    }),

  get: (id: string) =>
    api.get(`/admin/reservations/${id}`),

  create: (data: any) =>
    api.post('/admin/reservations', data),

  approve: (id: string) =>
    api.post(`/admin/reservations/${id}/approve`, {}),

  reject: (id: string, reason: string) =>
    api.post(`/admin/reservations/${id}/reject`, { reason }),
};

// Vouchers
export const voucherAPI = {
  list: (utilizado?: boolean) =>
    api.get('/admin/vouchers', {
      params: { utilizado },
    }),

  get: (codigo: string) =>
    api.get(`/admin/vouchers/${codigo}`),

  validate: (codigo: string) =>
    api.post(`/admin/vouchers/${codigo}/validate`, {}),
};

// Admin
export const adminAPI = {
  stats: () =>
    api.get('/admin/stats'),

  users: () =>
    api.get('/admin/users'),

  createUser: (data: any) =>
    api.post('/admin/users', data),

  reports: (type: string = 'summary') =>
    api.get('/admin/reports', {
      params: { type },
    }),
};

export default api;
