import axios from 'axios';
import { Repository, Review, ReviewReport, ApiResponse } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 仓库管理API
export const repositoryApi = {
  // 获取所有仓库
  getAll: async (): Promise<Repository[]> => {
    const response = await api.get<ApiResponse<Repository[]>>('/repositories');
    return response.data.data || [];
  },

  // 添加仓库
  add: async (data: { name: string; url: string; description?: string }): Promise<Repository> => {
    const response = await api.post<ApiResponse<Repository>>('/repositories', data);
    if (!response.data.success) {
      throw new Error(response.data.error || '添加仓库失败');
    }
    return response.data.data!;
  },

  // 删除仓库
  delete: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<void>>(`/repositories/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '删除仓库失败');
    }
  },

  // 获取仓库详情
  getById: async (id: string): Promise<Repository> => {
    const response = await api.get<ApiResponse<Repository>>(`/repositories/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '获取仓库详情失败');
    }
    return response.data.data!;
  },
};

// 代码评审API
export const reviewApi = {
  // 获取所有评审
  getAll: async (): Promise<Review[]> => {
    const response = await api.get<ApiResponse<Review[]>>('/review');
    return response.data.data || [];
  },

  // 创建评审
  create: async (data: { repository_id: string; start_date: string; end_date: string }): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>('/review', data);
    if (!response.data.success) {
      throw new Error(response.data.error || '创建评审失败');
    }
    return response.data.data!;
  },

  // 获取评审详情
  getById: async (id: string): Promise<Review> => {
    const response = await api.get<ApiResponse<Review>>(`/review/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '获取评审详情失败');
    }
    return response.data.data!;
  },

  // 生成评审报告
  generateReport: async (id: string): Promise<ReviewReport> => {
    const response = await api.post<ApiResponse<ReviewReport>>(`/review/${id}/report`);
    if (!response.data.success) {
      throw new Error(response.data.error || '生成评审报告失败');
    }
    return response.data.data!;
  },

  // 获取评审报告
  getReport: async (id: string): Promise<ReviewReport> => {
    const response = await api.get<ApiResponse<ReviewReport>>(`/review/${id}/report`);
    if (!response.data.success) {
      throw new Error(response.data.error || '获取评审报告失败');
    }
    return response.data.data!;
  },
};

export default api;
