import apiClient from '../api/client'
import type { AuthLoginParams, TokenResponse, RegisterResponse } from '../types'

export async function login(payload: AuthLoginParams): Promise<TokenResponse> {
  const res = await apiClient.post('/auth/login', payload)
  return res.data as TokenResponse
}

export async function register(payload: AuthLoginParams): Promise<RegisterResponse> {
  const res = await apiClient.post('/auth/register', payload)
  return res.data as RegisterResponse
}

// export other auth related methods here (refresh, me, etc.) as needed
