import { useState, type FormEvent } from 'react'
import './EditProfileModal.css'

interface Props {
  profile: any
  onSave: (data: any) => Promise<void>
  onClose: () => void
}

export default function EditProfileModal({ profile, onSave, onClose }: Props) {
  const [firstName, setFirstName] = useState(profile.user.first_name || '')
  const [lastName, setLastName] = useState(profile.user.last_name || '')
  const [phone, setPhone] = useState(profile.user.phone_number || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onSave({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
      })
    } catch {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="modal-close" onClick={onClose}><i className="bx bx-x"></i></button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="add-error">{error}</div>}
          <div className="form-row">
            <div className="form-group flex-1">
              <label>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group flex-1">
              <label>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
          </div>
          <button type="submit" className="btn-create" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}