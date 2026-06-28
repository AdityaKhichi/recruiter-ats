import apiClient from '../api/client'
import type { AuthLoginParams, AuthLoginResponse } from '../types'

export async function login(payload: AuthLoginParams): Promise<AuthLoginResponse> {
  const res = await apiClient.post('/auth/login', payload)
  return res.data as AuthLoginResponse
}

export async function register(payload: AuthLoginParams): Promise<AuthLoginResponse> {
  const res = await apiClient.post('/auth/register', payload)
  return res.data as AuthLoginResponse
}

// export other auth related methods here (refresh, me, etc.) as needed
