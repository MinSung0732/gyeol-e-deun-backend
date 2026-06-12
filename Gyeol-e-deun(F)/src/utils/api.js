import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE,
});

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function authHeaders(token = getAccessToken()) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  members: {
    me: '/api/members/me',
    login: '/api/members/login',
    register: '/api/members/register',
  },
  products: {
    list: '/api/products',
    detail: (id) => `/api/products/${id}`,
  },
  categories: {
    list: '/api/categories',
    add: '/api/admin/categories',
    delete: (id) => `/api/admin/categories/${id}`,
  },
  admin: {
    products: '/api/admin/products',
    upload: '/api/admin/upload',
    bulkProducts: '/api/admin/products/bulk',
  },
  cart: {
    list: '/api/cart',
    add: '/api/cart',
    remove: (id) => `/api/cart/${id}`,
  },
  wishlist: {
    list: '/api/wishlist',
    toggle: (productId) => `/api/wishlist/toggle/${productId}`,
  },
};
