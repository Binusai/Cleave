import apiClient from './client'

export const fetchGroups = async () => {
  const response = await apiClient.get('/groups/')
  return response.data
}

export const fetchGroupDetail = async (id: number) => {
  const response = await apiClient.get(`/groups/${id}/`)
  return response.data
}

export const createGroup = async (data: { name: string; description?: string; group_type?: string }) => {
  const response = await apiClient.post('/groups/', data)
  return response.data
}

export const updateGroup = async (id: number, data: { name?: string; description?: string; group_type?: string }) => {
  const response = await apiClient.put(`/groups/${id}/`, data)
  return response.data
}

export const deleteGroup = async (id: number) => {
  await apiClient.delete(`/groups/${id}/`)
}

export const fetchMembers = async (groupId: number) => {
  const response = await apiClient.get(`/groups/${groupId}/members/`)
  return response.data
}

export const removeMember = async (groupId: number, userId: number) => {
  const response = await apiClient.delete(`/groups/${groupId}/members/`, { data: { user_id: userId } })
  return response.data
}

export const updateMemberRole = async (groupId: number, userId: number, role: string) => {
  const response = await apiClient.put(`/groups/${groupId}/members/${userId}/role/`, { role })
  return response.data
}

export const transferOwnership = async (groupId: number, userId: number) => {
  const response = await apiClient.post(`/groups/${groupId}/transfer-ownership/`, { user_id: userId })
  return response.data
}

export const createInvitation = async (groupId: number, data: { email?: string; user_id?: number; message?: string }) => {
  const response = await apiClient.post(`/groups/${groupId}/invitations/`, data)
  return response.data
}

export const fetchGroupBalances = async (groupId: number) => {
  const response = await apiClient.get(`/groups/${groupId}/balances/`)
  return response.data
}

export const fetchMyInvitations = async () => {
  const response = await apiClient.get('/groups/invitations/')
  return response.data
}

export const acceptInvitation = async (invitationId: number) => {
  const response = await apiClient.post(`/groups/invitations/${invitationId}/accept/`)
  return response.data
}

export const rejectInvitation = async (invitationId: number) => {
  const response = await apiClient.post(`/groups/invitations/${invitationId}/reject/`)
  return response.data
}