import apiClient from './client'

export const fetchProfile = async () => {
  const response = await apiClient.get('/users/profile/')
  return response.data
}

export const updateProfile = async (data: { first_name?: string; last_name?: string; phone_number?: string }) => {
  const response = await apiClient.put('/users/profile/update/', data)
  return response.data
}

export const changePassword = async (data: { current_password: string; new_password: string }) => {
  const response = await apiClient.post('/users/profile/change-password/', data)
  return response.data
}

export const deactivateAccount = async () => {
  const response = await apiClient.post('/users/profile/deactivate/')
  return response.data
}