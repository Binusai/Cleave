import { useState, useEffect } from 'react'
import { fetchMembers, removeMember, updateMemberRole, transferOwnership } from '../../api/groups'
import './MembersList.css'

interface Props {
  groupId: number
  userRole: string
  onRefresh: () => void
}

export default function MembersList({ groupId, userRole, onRefresh }: Props) {
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    loadMembers()
  }, [groupId])

  const loadMembers = async () => {
    try {
      const data = await fetchMembers(groupId)
      setMembers(data)
    } catch (err) {
      console.error('Failed to load members:', err)
    }
  }

  const handleRemove = async (userId: number, userName: string) => {
    if (!confirm(`Remove ${userName} from the group?`)) return
    try {
      await removeMember(groupId, userId)
      loadMembers()
      onRefresh()
    } catch (err) {
      console.error('Failed to remove member:', err)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateMemberRole(groupId, userId, newRole)
      loadMembers()
    } catch (err) {
      console.error('Failed to update role:', err)
    }
  }

  const handleTransfer = async (userId: number, userName: string) => {
    if (!confirm(`Transfer ownership to ${userName}? You will become an admin.`)) return
    try {
      await transferOwnership(groupId, userId)
      loadMembers()
      onRefresh()
    } catch (err) {
      console.error('Failed to transfer ownership:', err)
    }
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      owner: '#FEF3C7',
      admin: '#EEF2FF',
      member: '#F1F5F9',
    }
    return { background: colors[role] || '#F1F5F9' }
  }

  return (
    <div className="members-list">
      {members.map((member: any) => (
        <div key={member.id} className="member-item">
          <div className="member-avatar">
            {member.user_name?.charAt(0) || '?'}
          </div>
          <div className="member-info">
            <span className="member-name">{member.user_name}</span>
            <span className="member-email">{member.user_email}</span>
          </div>
          <span className="member-role" style={roleBadge(member.role)}>
            {member.role}
          </span>
          {(userRole === 'owner' || userRole === 'admin') && member.role !== 'owner' && (
            <div className="member-actions">
              {userRole === 'owner' && (
                <>
                  <button onClick={() => handleRoleChange(member.user, member.role === 'admin' ? 'member' : 'admin')}>
                    {member.role === 'admin' ? 'Demote' : 'Make Admin'}
                  </button>
                  <button onClick={() => handleTransfer(member.user, member.user_name)}>
                    Transfer
                  </button>
                </>
              )}
              <button className="remove-btn" onClick={() => handleRemove(member.user, member.user_name)}>
                Remove
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}