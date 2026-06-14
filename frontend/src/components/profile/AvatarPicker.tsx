import './AvatarPicker.css'

interface Avatar {
  id: string
  bg: string
  color: string
  icon: string
}

interface Props {
  avatars: Avatar[]
  selected: string
  onSelect: (id: string) => void
  onClose: () => void
  userName: string
}

export default function AvatarPicker({ avatars, selected, onSelect, onClose, userName }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container avatar-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose Avatar</h2>
          <button className="modal-close" onClick={onClose}><i className="bx bx-x"></i></button>
        </div>
        <div className="avatar-grid">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              className={`avatar-option ${selected === avatar.id ? 'selected' : ''}`}
              style={{ background: avatar.bg, color: avatar.color }}
              onClick={() => onSelect(avatar.id)}
            >
              <span className="avatar-initial">{userName.charAt(0).toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}