import apiClient from './client'

export const fetchNotifications = async (params?: string) => {
  const url = params ? `/notifications/?${params}` : '/notifications/'
  const response = await apiClient.get(url)
  return response.data
}

export const fetchUnreadCount = async () => {
  const response = await apiClient.get('/notifications/unread-count/')
  return response.data
}

export const fetchNotificationSummary = async () => {
  const response = await apiClient.get('/notifications/summary/')
  return response.data
}

export const markAsRead = async (id: number) => {
  const response = await apiClient.post(`/notifications/${id}/mark-read/`)
  return response.data
}

export const markAllAsRead = async () => {
  const response = await apiClient.post('/notifications/mark-all-read/')
  return response.data
}