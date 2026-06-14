import apiClient from './client'

export const fetchSummary = async () => {
  const response = await apiClient.get('/dashboard/summary/')
  return response.data
}

export const fetchGroupBalances = async () => {
  const response = await apiClient.get('/dashboard/groups/')
  return response.data
}

export const fetchRecentActivity = async () => {
  const response = await apiClient.get('/dashboard/activity/')
  return response.data
}

export const fetchMonthlySpending = async () => {
  const response = await apiClient.get('/dashboard/monthly-spending/')
  return response.data
}

export const fetchCategoryBreakdown = async () => {
  const response = await apiClient.get('/dashboard/category-breakdown/')
  return response.data
}