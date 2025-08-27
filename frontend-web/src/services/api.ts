import axios, { AxiosResponse } from 'axios';
import { 
  User, 
  Product, 
  Category, 
  CartItem, 
  Order, 
  OrderItem, 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/login', credentials),
  
  register: (userData: RegisterRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/register', userData),
  
  validateToken: (): Promise<AxiosResponse<boolean>> =>
    api.post('/auth/validate'),
};

// Users API
export const usersAPI = {
  getAll: (): Promise<AxiosResponse<User[]>> =>
    api.get('/users'),
  
  getById: (id: string): Promise<AxiosResponse<User>> =>
    api.get(`/users/${id}`),
  
  getByEmail: (email: string): Promise<AxiosResponse<User>> =>
    api.get(`/users/email/${email}`),
  
  create: (user: Partial<User>): Promise<AxiosResponse<User>> =>
    api.post('/users', user),
  
  update: (id: string, user: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put(`/users/${id}`, user),
  
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/users/${id}`),
  
  deactivate: (id: string): Promise<AxiosResponse<void>> =>
    api.patch(`/users/${id}/deactivate`),
  
  search: (name: string): Promise<AxiosResponse<User[]>> =>
    api.get(`/users/search?name=${name}`),
  
  getByRole: (role: string): Promise<AxiosResponse<User[]>> =>
    api.get(`/users/role/${role}`),
  
  count: (): Promise<AxiosResponse<number>> =>
    api.get('/users/count'),
};

// Products API
export const productsAPI = {
  getAll: (page = 0, size = 20): Promise<AxiosResponse<Product[]>> =>
    api.get(`/products?page=${page}&size=${size}`),
  
  getById: (id: string): Promise<AxiosResponse<Product>> =>
    api.get(`/products/${id}`),
  
  getBySku: (sku: string): Promise<AxiosResponse<Product>> =>
    api.get(`/products/sku/${sku}`),
  
  getByCategory: (categoryId: string): Promise<AxiosResponse<Product[]>> =>
    api.get(`/products/category/${categoryId}`),
  
  search: (name: string): Promise<AxiosResponse<Product[]>> =>
    api.get(`/products/search?name=${name}`),
  
  getByPriceRange: (minPrice: number, maxPrice: number): Promise<AxiosResponse<Product[]>> =>
    api.get(`/products/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`),
  
  getInStock: (): Promise<AxiosResponse<Product[]>> =>
    api.get('/products/in-stock'),
  
  getLatest: (limit = 10): Promise<AxiosResponse<Product[]>> =>
    api.get(`/products/latest?limit=${limit}`),
  
  create: (product: Partial<Product>): Promise<AxiosResponse<Product>> =>
    api.post('/products', product),
  
  update: (id: string, product: Partial<Product>): Promise<AxiosResponse<Product>> =>
    api.put(`/products/${id}`, product),
  
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/products/${id}`),
  
  deactivate: (id: string): Promise<AxiosResponse<void>> =>
    api.patch(`/products/${id}/deactivate`),
  
  updateStock: (id: string, quantity: number): Promise<AxiosResponse<Product>> =>
    api.patch(`/products/${id}/stock?quantity=${quantity}`),
  
  count: (): Promise<AxiosResponse<number>> =>
    api.get('/products/count'),
  
  countByCategory: (categoryId: string): Promise<AxiosResponse<number>> =>
    api.get(`/products/category/${categoryId}/count`),
};

// Categories API
export const categoriesAPI = {
  getAll: (): Promise<AxiosResponse<Category[]>> =>
    api.get('/categories'),
  
  getById: (id: string): Promise<AxiosResponse<Category>> =>
    api.get(`/categories/${id}`),
  
  create: (category: Partial<Category>): Promise<AxiosResponse<Category>> =>
    api.post('/categories', category),
  
  update: (id: string, category: Partial<Category>): Promise<AxiosResponse<Category>> =>
    api.put(`/categories/${id}`, category),
  
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/categories/${id}`),
  
  search: (name: string): Promise<AxiosResponse<Category[]>> =>
    api.get(`/categories/search?name=${name}`),
  
  count: (): Promise<AxiosResponse<number>> =>
    api.get('/categories/count'),
};

// Shopping Cart API
export const cartAPI = {
  getItems: (userId: string): Promise<AxiosResponse<CartItem[]>> =>
    api.get(`/cart/${userId}`),
  
  addItem: (userId: string, productId: string, quantity: number): Promise<AxiosResponse<CartItem>> =>
    api.post(`/cart/${userId}/items?productId=${productId}&quantity=${quantity}`),
  
  updateItem: (userId: string, productId: string, quantity: number): Promise<AxiosResponse<CartItem>> =>
    api.put(`/cart/${userId}/items/${productId}?quantity=${quantity}`),
  
  removeItem: (userId: string, productId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/cart/${userId}/items/${productId}`),
  
  clear: (userId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/cart/${userId}`),
  
  getTotal: (userId: string): Promise<AxiosResponse<number>> =>
    api.get(`/cart/${userId}/total`),
  
  getCount: (userId: string): Promise<AxiosResponse<number>> =>
    api.get(`/cart/${userId}/count`),
  
  validate: (userId: string): Promise<AxiosResponse<boolean>> =>
    api.get(`/cart/${userId}/validate`),
};

// Orders API
export const ordersAPI = {
  getAll: (page = 0, size = 20): Promise<AxiosResponse<Order[]>> =>
    api.get(`/orders?page=${page}&size=${size}`),
  
  getById: (id: string): Promise<AxiosResponse<Order>> =>
    api.get(`/orders/${id}`),
  
  getByNumber: (orderNumber: string): Promise<AxiosResponse<Order>> =>
    api.get(`/orders/number/${orderNumber}`),
  
  getByUser: (userId: string): Promise<AxiosResponse<Order[]>> =>
    api.get(`/orders/user/${userId}`),
  
  getByStatus: (status: string): Promise<AxiosResponse<Order[]>> =>
    api.get(`/orders/status/${status}`),
  
  getItems: (orderId: string): Promise<AxiosResponse<OrderItem[]>> =>
    api.get(`/orders/${orderId}/items`),
  
  createFromCart: (
    userId: string, 
    shippingAddress: string, 
    billingAddress?: string, 
    paymentMethod?: string
  ): Promise<AxiosResponse<Order>> =>
    api.post(`/orders/create-from-cart?userId=${userId}&shippingAddress=${encodeURIComponent(shippingAddress)}&billingAddress=${encodeURIComponent(billingAddress || '')}&paymentMethod=${paymentMethod || ''}`),
  
  updateStatus: (id: string, status: string): Promise<AxiosResponse<Order>> =>
    api.patch(`/orders/${id}/status?status=${status}`),
  
  updatePaymentStatus: (id: string, paymentStatus: string): Promise<AxiosResponse<Order>> =>
    api.patch(`/orders/${id}/payment-status?paymentStatus=${paymentStatus}`),
  
  cancel: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/orders/${id}/cancel`),
  
  countByUser: (userId: string): Promise<AxiosResponse<number>> =>
    api.get(`/orders/user/${userId}/count`),
  
  countByStatus: (status: string): Promise<AxiosResponse<number>> =>
    api.get(`/orders/status/${status}/count`),
};

export default api;
