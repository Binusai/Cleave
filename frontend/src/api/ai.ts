import apiClient from './client'

export const fetchInsights = async () => {
  const response = await apiClient.get('/ai/insights/')
  return response.data
}

export const fetchRecommendations = async () => {
  const response = await apiClient.get('/ai/recommendations/')
  return response.data
}

export const sendChatMessage = async (message: string) => {
  const response = await apiClient.post('/ai/chat/', { message }, {
    headers: { 'X-Skip-Loader': 'true' }
  })
  return response.data
}

export const fetchSuggestedQuestions = async () => {
  const response = await apiClient.get('/ai/suggested-questions/')
  return response.data
}
