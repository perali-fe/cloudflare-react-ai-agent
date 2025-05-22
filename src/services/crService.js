// src/services/crService.js
import axios from 'axios';

const API_BASE_URL = 'https://agents.pera0520.xyz/api';

// 创建一个axios实例，可以设置通用配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30秒超时
});

// 请求拦截器 - 可以在这里添加认证令牌等
apiClient.interceptors.request.use(
  (config) => {
    // 如果有认证机制，可以在这里添加
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 可以在这里统一处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 可以根据错误状态码进行不同处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，可以重定向到登录页
          console.error('Unauthorized access');
          // 可以触发登出操作或重定向
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`Error with status code: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// CR Agent相关API
const crService = {
  // 提交代码获取CR反馈
  submitCodeForReview: async (code) => {
    const response = await apiClient.post('/agents/crAgent/generate', { messages: code });
    return response.data;
  },
  
  // 如果有其他与CR相关的API，可以在这里添加
};

export default crService;