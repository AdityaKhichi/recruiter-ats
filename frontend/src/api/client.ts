import axios from 'axios'

// Centralized axios instance. Reads base URL from VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL ?? ''

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // enable if your backend uses cookies
})

// Attach token to each request if present in localStorage
apiClient.interceptors.request.use((config) => {
  try {
    // Do not attach auth header for login/register endpoints
    const url = config.url ?? ''
    if (url.includes('/auth/login') || url.includes('/auth/register')) {
      return config
    }

    const token = localStorage.getItem('auth_token')
    if (token) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers = config.headers ?? {}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

let logoutHandler: (() => void) | null = null
export function setLogoutHandler(fn: () => void) {
  logoutHandler = fn
}

// Helper to set token (e.g. after login)
export function setAuthToken(token?: string | null) {
  if (token) {
    localStorage.setItem('auth_token', token)
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    localStorage.removeItem('auth_token')
    delete apiClient.defaults.headers.common['Authorization']
  }
}

// Response interceptor to handle 401 globally
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      // call registered logout handler if present
      try {
        if (logoutHandler) logoutHandler()
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(err)
  }
)

export default apiClient
