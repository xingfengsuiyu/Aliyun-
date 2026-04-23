/**
 * API 接口封装模块
 * 提供所有后端 API 的统一调用入口
 * 包含请求/响应拦截器，自动处理 Token
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 后端 API 基础地址
// 注意：模拟器使用 10.0.2.2 (Android) 或 localhost (iOS)
// 真机使用电脑的局域网 IP 地址
const API_BASE_URL = 'http://localhost:8080/api';

// 创建 axios 实例，配置基础参数
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 在发送请求前自动添加 JWT Token 到请求头
 */
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 统一处理响应数据和错误
 */
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.code !== undefined && response.data.code !== 200) {
      return Promise.reject({
        response: response,
        message: response.data.message || '请求失败',
        code: response.data.code
      });
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('userInfo');
    }
    if (error.response?.data?.code !== undefined) {
      error.code = error.response.data.code;
      error.message = error.response.data.message || '请求失败';
    }
    return Promise.reject(error);
  }
);

// ==================== 认证相关 API ====================

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.post('/auth/me'),
  updateProfile: (data) => api.post('/auth/profile', data),
  sendCode: (email) => api.post('/auth/send-code', email, { headers: { 'Content-Type': 'text/plain' } }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ==================== 房源管理 API ====================

export const propertyAPI = {
  getList: (data) => api.post('/properties/list', data),
  search: (data) => api.post('/properties/list', data),
  getById: (data) => api.post('/properties/get', { id: data }),
  create: (data) => api.post('/properties', data),
  update: (data) => api.post('/properties/update', data),
  delete: (data) => api.post('/properties/delete', { id: data }),
  updateStatus: (data) => api.post('/properties/status', data),
  batchCreate: (data) => api.post('/properties/batch/create', data),
  batchUpdate: (data) => api.post('/properties/batch/update', data),
};

// ==================== 租客管理 API ====================

export const tenantAPI = {
  getList: (data) => api.post('/tenants/list', data),
  getById: (data) => api.post('/tenants/get', { id: data }),
  create: (data) => api.post('/tenants', data),
  update: (data) => api.post('/tenants/update', data),
  markAsMovedOut: (data) => api.post('/tenants/moveout', { id: data }),
};

// ==================== 租约管理 API ====================

export const leaseAPI = {
  getList: (data) => api.post('/leases/list', data),
  search: (data) => api.post('/leases/list', data),
  getActiveLeases: () => api.post('/leases/active'),
  getExpiringLeases: () => api.post('/leases/expiring'),
  getById: (data) => api.post('/leases/get', { id: data }),
  create: (data) => api.post('/leases', data),
  renew: (data) => api.post('/leases/renew', data),
  terminate: (data) => api.post('/leases/terminate', data),
};

// ==================== 账单管理 API ====================

export const billAPI = {
  getList: (data) => api.post('/bills/list', data),
  search: (data) => api.post('/bills/list', data),
  getStatistics: () => api.post('/bills/statistics'),
  getPendingBills: () => api.post('/bills/pending'),
  getById: (data) => api.post('/bills/get', { id: data }),
  create: (data) => api.post('/bills', data),
  delete: (data) => api.post('/bills/delete', { id: data }),
  recordPayment: (data) => api.post('/bills/pay', data),
};

// ==================== 意见反馈 API ====================

export const feedbackAPI = {
  getList: (data) => api.post('/feedbacks/list', data),
  getById: (data) => api.post('/feedbacks/get', { id: data }),
  create: (data) => api.post('/feedbacks', data),
  reply: (data) => api.post('/feedbacks/reply', data),
  close: (data) => api.post('/feedbacks/close', { id: data }),
};

// ==================== Dashboard API ====================

export const dashboardAPI = {
  getStatistics: () => api.post('/dashboard/statistics'),
};

// 导出 api 实例，供特殊场景使用
export default api;