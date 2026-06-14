import { useState, type FormEvent } from 'react'
import './CreateGroupModal.css'

interface Props {
  onClose: () => void
  onCreate: (data: { name: string; description: string; group_type: string }) => void
}

const groupTypes = [
  { value: 'friends', label: 'Friends', icon: 'bx-group' },
  { value: 'family', label: 'Family', icon: 'bx-home-heart' },
  { value: 'trip', label: 'Trip', icon: 'bx-map' },
  { value: 'couple', label: 'Couple', icon: 'bx-heart' },
  { value: 'roommates', label: 'Roommates', icon: 'bx-building-house' },
  { value: 'office', label: 'Office', icon: 'bx-briefcase' },
  { value: 'event', label: 'Event', icon: 'bx-calendar-star' },
  { value: 'custom', label: 'Custom', icon: 'bx-shapes' },
]

export default function CreateGroupModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [groupType, setGroupType] = useState('friends')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({ name: name.trim(), description: description.trim(), group_type: groupType })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Group</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="bx bx-x"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              placeholder="e.g., Goa Trip, Apartment Rent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              placeholder="What's this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>Group Type</label>
            <div className="type-grid">
              {groupTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`type-option ${groupType === type.value ? 'selected' : ''}`}
                  onClick={() => setGroupType(type.value)}
                >
                  <i className={`bx ${type.icon}`}></i>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-create">Create Group</button>
        </form>
      </div>
    </div>
  )
}