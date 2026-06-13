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
    view: (id) => `/api/products/${id}/view`,
    searchStat: '/api/products/search-stat',
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
    productTrash: '/api/admin/products/trash',
    restoreProductTrash: '/api/admin/products/trash/restore',
    productSummary: '/api/admin/products/summary',
    members: '/api/admin/members',
    memberMemo: (memberId) => `/api/admin/members/${memberId}/memo`,
    memberBenefits: (memberId) => `/api/admin/members/${memberId}/benefits`,
    memberBlacklist: (memberId) => `/api/admin/members/${memberId}/blacklist`,
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
