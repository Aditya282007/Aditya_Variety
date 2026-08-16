import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Try to refresh the token via the refresh endpoint
        // For now, just clear user and let ProtectedRoute handle redirect
        localStorage.removeItem('user')
        
        // Don't do window.location.href - let React Router handle it
        // The AuthProvider will set user to null on next check
        isRefreshing = false
        processQueue(error)
        return Promise.reject(error)
      } catch (err) {
        isRefreshing = false
        processQueue(err)
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data: { name: string; phone: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { phone: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string; password?: string }) =>
    api.put('/auth/profile', data)
}

export const productAPI = {
  getAll: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  create: (data: FormData) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id: string) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock')
}

export const orderAPI = {
  create: (items: { productId: string; qty: number }[]) =>
    api.post('/orders', { items }),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/orders', { params }),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
  getDashboardStats: () => api.get('/orders/dashboard/stats')
}

export default api