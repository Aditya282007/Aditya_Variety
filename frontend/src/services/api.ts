const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface ApiResponse<T> {
  data: T
  message?: string
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const contentType = res.headers.get('content-type')
  const data = contentType?.includes('application/json') ? await res.json().catch(() => ({})) : {}

  if (!res.ok) {
    throw new ResponseError(res.status, data.message || 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return data as T
}

class ResponseError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ResponseError'
  }
}

function isResponseError(err: unknown): err is ResponseError {
  return err instanceof ResponseError
}

export const authAPI = {
  register: (data: { name: string; phone: string; password: string }) =>
    request<ApiResponse<{ _id: string; name: string; phone: string; role: string; token: string }>>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { phone: string; password: string }) =>
    request<ApiResponse<{ _id: string; name: string; phone: string; role: string; token: string }>>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request<ApiResponse<{ _id: string; name: string; phone: string; role: string }>>('/auth/me'),
  updateProfile: (data: { name?: string; phone?: string; password?: string }) =>
    request<ApiResponse<{ _id: string; name: string; phone: string; role: string }>>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
}

export const productAPI = {
  getAll: (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.category && params.category !== 'all') searchParams.set('category', params.category)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    return request<ApiResponse<{ products: any[]; totalPages: number; currentPage: number; total: number }>>(`/products?${searchParams.toString()}`)
  },
  getById: (id: string) => request<ApiResponse<any>>(`/products/${id}`),
  getCategories: () => request<ApiResponse<string[]>>('/products/categories'),
  create: (data: FormData) => request<ApiResponse<any>>('/products', { method: 'POST', body: data, headers: {} }),
  update: (id: string, data: FormData) => request<ApiResponse<any>>(`/products/${id}`, { method: 'PUT', body: data, headers: {} }),
  delete: (id: string) => request<ApiResponse<any>>(`/products/${id}`, { method: 'DELETE' }),
  getLowStock: () => request<ApiResponse<any[]>>('/products/low-stock'),
}

export const orderAPI = {
  create: (items: { productId: string; qty: number }[]) =>
    request<ApiResponse<any>>('/orders', { method: 'POST', body: JSON.stringify({ items }) }),
  getMyOrders: () => request<ApiResponse<any[]>>('/orders/my-orders'),
  getById: (id: string) => request<ApiResponse<any>>(`/orders/${id}`),
  getAll: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    return request<ApiResponse<{ orders: any[]; totalPages: number; currentPage: number; total: number }>>(`/orders?${searchParams.toString()}`)
  },
  updateStatus: (id: string, status: string) =>
    request<ApiResponse<any>>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getDashboardStats: () => request<ApiResponse<{ totalOrdersToday: number; pendingOrders: number; lowStockCount: number }>>('/orders/dashboard/stats'),
}

export { isResponseError }
export default request