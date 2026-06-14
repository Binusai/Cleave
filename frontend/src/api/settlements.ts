import apiClient from './client'

export const fetchSettlements = async (params?: string) => {
  const url = params ? `/settlements/?${params}` : '/settlements/'
  const response = await apiClient.get(url)
  return response.data
}

export const fetchSettlementSummary = async () => {
  const response = await apiClient.get('/settlements/summary/')
  return response.data
}

export const fetchSettlementProgress = async () => {
  const response = await apiClient.get('/settlements/progress/')
  return response.data
}

export const completeSettlement = async (id: number) => {
  const response = await apiClient.post(`/settlements/${id}/complete/`)
  return response.data
}

export const remindSettlement = async (id: number) => {
  const response = await apiClient.post(`/settlements/${id}/remind/`)
  return response.data
}

export const ignoreSettlement = async (id: number) => {
  const response = await apiClient.post(`/settlements/${id}/ignore/`)
  return response.data
}