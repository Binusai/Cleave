import apiClient from './client'

export const fetchOverview = async (params?: string) => {
  const url = params ? `/analytics/overview/?${params}` : '/analytics/overview/'
  const response = await apiClient.get(url)
  return response.data
}

export const fetchSpendingTrends = async (params?: string) => {
  const url = params ? `/analytics/spending-trends/?${params}` : '/analytics/spending-trends/'
  const response = await apiClient.get(url)
  return response.data
}

export const fetchCategories = async (params?: string) => {
  const url = params ? `/analytics/categories/?${params}` : '/analytics/categories/'
  const response = await apiClient.get(url)
  return response.data
}

export const fetchGroupAnalytics = async (params?: string) => {
  const url = params ? `/analytics/groups/?${params}` : '/analytics/groups/'
  const response = await apiClient.get(url)
  return response.data
}

export const fetchPeopleAnalytics = async (params?: string) => {
  const url = params ? `/analytics/people/?${params}` : '/analytics/people/'
  const response = await apiClient.get(url)
  return response.data
}

export const fetchFinancialHealth = async () => {
  const response = await apiClient.get('/analytics/financial-health/')
  return response.data
}