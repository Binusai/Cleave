import apiClient from './client'

export const fetchPreferences = async () => {
  const response = await apiClient.get('/users/preferences/')
  return response.data
}

export const updatePreferences = async (data: any) => {
  const response = await apiClient.put('/users/preferences/', data)
  return response.data
}