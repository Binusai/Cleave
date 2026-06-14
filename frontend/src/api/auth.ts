import apiClient from './client'

interface LoginPayload {
  login_identifier: string
  password: string
}

interface RegisterPayload {
  email: string
  phone_number?: string
  password: string
}

interface AuthResponse {
  tokens: {
    access: string
    refresh: string
  }
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    phone_number: string | null
    is_email_verified: boolean
    date_joined: string
  }
}

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login/', payload)
  return response.data
}

export const registerUser = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register/', payload)
  return response.data
}

export const googleAuth = async (accessToken: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/google/', {
    access_token: accessToken,
  })
  return response.data
}

export const fetchProfile = async (): Promise<AuthResponse['user']> => {
  const response = await apiClient.get<AuthResponse['user']>('/auth/profile/')
  return response.data
}