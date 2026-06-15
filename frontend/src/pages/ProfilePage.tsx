import { useState, useEffect } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import AvatarPicker from '../components/profile/AvatarPicker'
import EditProfileModal from '../components/profile/EditProfileModal'
import { fetchProfile, updateProfile, changePassword } from '../api/profile'
import './ProfilePage.css'

const AVATARS = [
  { id: 'blue', bg: '#1E3A5F', color: '#FFFFFF', icon: 'bx-user' },
  { id: 'green', bg: '#16A34A', color: '#FFFFFF', icon: 'bx-user' },
  { id: 'navy', bg: '#0F172A', color: '#FFFFFF', icon: 'bx-user' },
  { id: 'slate', bg: '#64748B', color: '#FFFFFF', icon: 'bx-user' },
  { id: 'teal', bg: '#0D9488', color: '#FFFFFF', icon: 'bx-user' },
  { id: 'indigo', bg: '#4338CA', color: '#FFFFFF', icon: 'bx-user' },
]

export default function ProfilePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem('cleave_avatar') || 'blue'
  )

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await fetchProfile()
      setProfile(data)
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (avatarId: string) => {
    setSelectedAvatar(avatarId)
    localStorage.setItem('cleave_avatar', avatarId)
    setShowAvatarPicker(false)
  }

  const handleProfileUpdate = async (data: any) => {
    await updateProfile(data)
    setShowEditModal(false)
    loadProfile()
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    setPasswordSuccess('')
    if (!currentPassword || !newPassword) {
      setPasswordError('Both fields are required')
      return
    }
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword })
      setPasswordSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess('')
      }, 1500)
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to change password')
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const currentAvatar = AVATARS.find((a) => a.id === selectedAvatar) || AVATARS[0]

  if (loading || !profile) return <div className="loading-screen"><div className="loading-spinner" /></div>

  return (
    <div className="dashboard">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <div className="dashboard-content profile-page">

          <div className="profile-header">
            <div>
              <h1 className="profile-title">My Profile</h1>
              <p className="profile-subtitle">Manage your account and financial identity.</p>
            </div>
            <button className="btn-edit-profile" onClick={() => setShowEditModal(true)}>
              <i className="bx bx-pencil"></i> Edit Profile
            </button>
          </div>

          <div className="profile-hero-card">
            <div className="profile-hero-left">
              <div
                className="profile-avatar-large"
                style={{ background: currentAvatar.bg, color: currentAvatar.color }}
              >
                {profile.user.full_name.charAt(0).toUpperCase()}
              </div>
              <button className="btn-change-avatar" onClick={() => setShowAvatarPicker(true)}>
                Change Avatar
              </button>
            </div>
            <div className="profile-hero-center">
              <h2 className="profile-hero-name">{profile.user.full_name}</h2>
              <div className="profile-hero-contact">
                <span className="profile-email">
                  {profile.user.email}
                  <span className="badge-verified green">Verified</span>
                </span>
                <span className="profile-phone">
                  {profile.user.phone_number || 'No phone added'}
                  {profile.user.phone_number ? (
                    <span className={`badge-verified ${profile.user.is_phone_verified ? 'green' : 'amber'}`}>
                      {profile.user.is_phone_verified ? 'Verified' : 'Verify Now'}
                    </span>
                  ) : (
                    <span className="badge-verified gray">Add Phone</span>
                  )}
                </span>
              </div>
            </div>
            <div className="profile-hero-right">
              <div className="profile-meta-item">
                <span className="meta-label">Member Since</span>
                <span className="meta-value">{profile.user.member_since}</span>
              </div>
              <div className="profile-meta-item">
                <span className="meta-label">Account ID</span>
                <span className="meta-value">{profile.user.account_id}</span>
              </div>
              <div className="profile-meta-item">
                <span className="meta-label">Status</span>
                <span className="meta-value-status active">Active</span>
              </div>
            </div>
          </div>

          <div className="profile-financial-row">
            <div className="financial-card">
              <span className="financial-label">Total Expenses</span>
              <span className="financial-value">{formatCurrency(profile.total_expenses)}</span>
              <span className="financial-sub">Across {profile.total_expenses_count} expenses</span>
            </div>
            <div className="financial-card">
              <span className="financial-label">Active Groups</span>
              <span className="financial-value">{profile.active_groups}</span>
              <span className="financial-sub">You participate in {profile.active_groups} groups</span>
            </div>
            <div className="financial-card">
              <span className="financial-label">Total Settled</span>
              <span className="financial-value">{formatCurrency(profile.total_settled)}</span>
              <span className="financial-sub">{profile.total_settlements_count} lifetime settlements</span>
            </div>
            <div className="financial-card">
              <span className="financial-label">Financial Health</span>
              <span className="financial-value" style={{ color: profile.financial_health?.health_color }}>
                {profile.financial_health?.health_label || 'N/A'}
              </span>
              <span className="financial-sub">{profile.financial_health?.health_score || 0} / 100</span>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-section-card">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{profile.user.full_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{profile.user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{profile.user.phone_number || 'Not added'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{profile.user.member_since}</span>
                </div>
              </div>
            </div>

            <div className="profile-section-card">
              <h3>Account Security</h3>
              <div className="security-list">
                <div className="security-item">
                  <div>
                    <span className="security-label">Password</span>
                    <span className="security-sub">Change your account password</span>
                  </div>
                  <button className="btn-security" onClick={() => setShowPasswordModal(true)}>
                    Change
                  </button>
                </div>
                <div className="security-item">
                  <div>
                    <span className="security-label">Two-Factor Authentication</span>
                    <span className="security-sub">Add extra security to your account</span>
                  </div>
                  <button className="btn-security outline">Enable</button>
                </div>
              </div>
            </div>

            <div className="profile-section-card danger-zone">
              <h3 style={{ color: '#DC2626' }}>Danger Zone</h3>
              <div className="security-item">
                <div>
                  <span className="security-label">Deactivate Account</span>
                  <span className="security-sub">Temporarily deactivate your account</span>
                </div>
                <button className="btn-security danger">Deactivate</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showAvatarPicker && (
        <AvatarPicker
          avatars={AVATARS}
          selected={selectedAvatar}
          onSelect={handleAvatarChange}
          onClose={() => setShowAvatarPicker(false)}
          userName={profile.user.full_name}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onSave={handleProfileUpdate}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}><i className="bx bx-x"></i></button>
            </div>
            {passwordError && <div className="add-error">{passwordError}</div>}
            {passwordSuccess && <div className="add-success">{passwordSuccess}</div>}
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button className="btn-create" onClick={handlePasswordChange}>Change Password</button>
          </div>
        </div>
      )}
    </div>
  )
}
