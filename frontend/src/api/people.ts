import apiClient from './client'

export const fetchContacts = async (params?: string) => {
  const url = params ? `/people/?${params}` : '/people/'
  const response = await apiClient.get(url)
  return response.data
}

export const fetchContactDetail = async (id: number) => {
  const response = await apiClient.get(`/people/${id}/`)
  return response.data
}

export const createContact = async (data: { name: string; email?: string; phone?: string; category_id?: number; notes?: string }) => {
  const response = await apiClient.post('/people/', data)
  return response.data
}

export const updateContact = async (id: number, data: any) => {
  const response = await apiClient.put(`/people/${id}/`, data)
  return response.data
}

export const deleteContact = async (id: number) => {
  await apiClient.delete(`/people/${id}/`)
}

export const toggleFavorite = async (id: number) => {
  const response = await apiClient.post(`/people/${id}/favorite/`)
  return response.data
}

export const fetchCategories = async () => {
  const response = await apiClient.get('/people/categories/')
  return response.data
}

export const createCategory = async (name: string) => {
  const response = await apiClient.post('/people/categories/', { name })
  return response.data
}