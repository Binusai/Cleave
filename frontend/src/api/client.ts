import axios from 'axios'

const API_BASE_URL = 'https://cleave-backend.onrender.com/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

let activeRequests = 0
let loadingCallback: ((val: boolean) => void) | null = null

export function setLoadingCallback(cb: (val: boolean) => void) {
  loadingCallback = cb
}

apiClient.interceptors.request.use((config) => {
  if (!config.headers?.['X-Skip-Loader']) {
    activeRequests++
    if (loadingCallback) loadingCallback(true)
  }

  const accessToken = sessionStorage.getItem('access_token')
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (!response.config.headers?.['X-Skip-Loader']) {
      activeRequests--
      if (activeRequests <= 0 && loadingCallback) {
        activeRequests = 0
        loadingCallback(false)
      }
    }
    return response
  },
  async (error) => {
    if (!error.config?.headers?.['X-Skip-Loader']) {
      activeRequests--
      if (activeRequests <= 0 && loadingCallback) {
        activeRequests = 0
        loadingCallback(false)
      }
    }

    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = sessionStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          activeRequests++
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })
          const { access } = response.data
          sessionStorage.setItem('access_token', access)
          originalRequest.headers.Authorization = `Bearer ${access}`
          activeRequests--
          if (activeRequests <= 0 && loadingCallback) loadingCallback(false)
          return apiClient(originalRequest)
        } catch {
          activeRequests--
          if (activeRequests <= 0 && loadingCallback) loadingCallback(false)
          sessionStorage.removeItem('access_token')
          sessionStorage.removeItem('refresh_token')
          window.location.href = '/auth'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
