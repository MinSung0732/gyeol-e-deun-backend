import { apiClient, api, authHeaders } from './api';

export async function addToCart({ productId, count }, token) {
  const response = await apiClient.post(
    api.cart.add,
    { productId, count },
    { headers: authHeaders(token) }
  );
  return response.data;
}
