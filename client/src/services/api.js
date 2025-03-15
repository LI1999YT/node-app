import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data
    });
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    if (response.data.code !== 0) {
      return Promise.reject(response.data);
    }
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// 认证相关接口
export const auth = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getCaptcha: () => api.get('/api/auth/captcha', { 
    responseType: 'text',
    transformResponse: [(data) => {
      try {
        return JSON.parse(data);
      } catch (e) {
        return { code: 500, message: '解析验证码失败' };
      }
    }]
  }),
  verifyEmail: (token) => api.get(`/api/auth/verify-email?token=${token}`)
};

// 商品相关接口
export const products = {
  getList: (params) => api.get('/api/products', { params }),
  getDetail: (id) => api.get(`/api/products/${id}`),
  search: (keyword) => api.get('/api/products/search', { params: { keyword } })
};

// 购物车相关接口
export const cart = {
  getCart: () => api.get('/api/cart'),
  addToCart: (data) => api.post('/api/cart', data),
  updateQuantity: (data) => api.put('/api/cart/quantity', data),
  removeFromCart: (id) => api.delete(`/api/cart/${id}`),
  selectItems: (data) => api.put('/api/cart/select', data)
};

// 订单相关接口
export const orders = {
  create: (data) => api.post('/api/orders', data),
  getList: (params) => api.get('/api/orders', { params }),
  getDetail: (id) => api.get(`/api/orders/${id}`),
  cancel: (id) => api.put(`/api/orders/${id}/cancel`),
  pay: (id, data) => api.post(`/api/orders/${id}/pay`, data)
};

// 物流相关接口
export const logistics = {
  track: (number) => api.get(`/api/logistics/track/${number}`)
};

// 用户相关接口
export const user = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
  getAddresses: () => api.get('/api/user/addresses'),
  addAddress: (data) => api.post('/api/user/addresses', data),
  updateAddress: (id, data) => api.put(`/api/user/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/api/user/addresses/${id}`)
};

export default api; 