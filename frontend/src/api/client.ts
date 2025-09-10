import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expiration)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
              const { accessToken } = response.data.data!;
              
              localStorage.setItem('accessToken', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Transform error for consistent handling
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          status: error.response?.status,
          // backend may send validation details in `validation` or `error`
          details: error.response?.data?.validation || error.response?.data?.error,
        };

        return Promise.reject(apiError);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.delete(url, config);
  }

  // Upload file with progress tracking
  async uploadFile<T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  // Download file
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Dashboard API methods
export const dashboardApi = {
  getDashboardOverview: (timeRange?: string) => 
    apiClient.get(`/dashboard/overview${timeRange ? `?timeRange=${timeRange}` : ''}`),
  
  getEnergyData: (params?: any) => 
    apiClient.get('/dashboard/energy-data', { params }),
  
  createEnergyData: (data: any) => 
    apiClient.post('/dashboard/energy-data', data),
  
  batchCreateEnergyData: (data: any[]) => 
    apiClient.post('/dashboard/energy-data/batch', { data }),
  
  getAnomalies: (params?: any) => 
    apiClient.get('/dashboard/anomalies', { params }),
  
  resolveAnomaly: (anomalyId: string, data: any) => 
    apiClient.put(`/dashboard/anomalies/${anomalyId}/resolve`, data),
  
  getLineStats: (lineId: string) => 
    apiClient.get(`/dashboard/lines/${lineId}/stats`),
};

// Auth API methods
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (userData: any) =>
    apiClient.post('/auth/register', userData),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
  
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
};

// Organizations API methods
export const organizationsApi = {
  getOrganizations: (params?: any) =>
    apiClient.get('/organizations', { params }),
  
  getOrganization: (id: string) =>
    apiClient.get(`/organizations/${id}`),
  
  createOrganization: (data: any) =>
    apiClient.post('/organizations', data),
  
  updateOrganization: (id: string, data: any) =>
    apiClient.put(`/organizations/${id}`, data),
  
  deleteOrganization: (id: string) =>
    apiClient.delete(`/organizations/${id}`),
};

// Users API methods
export const usersApi = {
  getUsers: (params?: any) =>
    apiClient.get('/users', { params }),
  
  getUser: (id: string) =>
    apiClient.get(`/users/${id}`),
  
  updateUser: (id: string, data: any) =>
    apiClient.put(`/users/${id}`, data),
  
  deleteUser: (id: string) =>
    apiClient.delete(`/users/${id}`),
  
  getCurrentUser: () =>
    apiClient.get('/users/me'),
  
  updateCurrentUser: (data: any) =>
    apiClient.put('/users/me', data),
};

// Reports API methods
export const reportsApi = {
  generateReport: (type: string, params?: any) =>
    apiClient.post(`/reports/generate/${type}`, params),
  
  getReports: (params?: any) =>
    apiClient.get('/reports', { params }),
  
  getReport: (id: string) =>
    apiClient.get(`/reports/${id}`),
  
  downloadReport: (id: string) =>
    apiClient.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

export const apiClient = new ApiClient();
