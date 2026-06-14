import apiClient from './client'

export const fetchGroupExpenses = async (groupId: number) => {
  const response = await apiClient.get(`/expenses/groups/${groupId}/`)
  return response.data
}

export const fetchCategories = async () => {
  const response = await apiClient.get('/expenses/categories/')
  return response.data
}

export const createExpense = async (groupId: number, data: any) => {
  const response = await apiClient.post(`/expenses/groups/${groupId}/`, data)
  return response.data
}

export const updateExpense = async (expenseId: number, data: any) => {
  const response = await apiClient.put(`/expenses/${expenseId}/`, data)
  return response.data
}

export const deleteExpense = async (expenseId: number) => {
  await apiClient.delete(`/expenses/${expenseId}/`)
}