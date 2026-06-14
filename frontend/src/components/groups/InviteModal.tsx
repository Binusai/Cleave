import { useState, type FormEvent } from 'react'
import { createInvitation } from '../../api/groups'
import './InviteModal.css'

interface Props {
  groupId: number
  onClose: () => void
  onInvite: () => void
}

export default function InviteModal({ groupId, onClose, onInvite }: Props) {
  const [mode, setMode] = useState<'email' | 'link'>('email')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleEmailInvite = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const inv = await createInvitation(groupId, { email: email.trim(), message: message.trim() })
      setInviteLink(`${window.location.origin}/join/${inv.invite_code}`)
      setEmail('')
      setMessage('')
      onInvite()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const generateLink = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    const link = `${window.location.origin}/groups/${groupId}`
    setInviteLink(link)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Members</h2>
          <button className="modal-close" onClick={onClose}><i className="bx bx-x"></i></button>
        </div>

        <div className="mode-tabs">
          <button className={`mode-tab ${mode === 'email' ? 'active' : ''}`} onClick={() => setMode('email')}>
            <i className="bx bx-envelope"></i> Email Invite
          </button>
          <button className={`mode-tab ${mode === 'link' ? 'active' : ''}`} onClick={() => { setMode('link'); generateLink() }}>
            <i className="bx bx-qr"></i> QR / Link
          </button>
        </div>

        {error && <div className="add-error">{error}</div>}

        {mode === 'email' ? (
          <form onSubmit={handleEmailInvite}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Message (optional)</label>
              <textarea
                placeholder="Hey, join my group on Cleave!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
              />
            </div>
            <button type="submit" className="btn-create" disabled={loading}>
              <i className="bx bx-send"></i> {loading ? 'Sending...' : 'Send Invitation'}
            </button>

            {inviteLink && (
              <div className="invite-link-section">
                <p>Invitation sent! Share this link:</p>
                <div className="invite-link-box">
                  <input type="text" value={inviteLink} readOnly />
                  <button type="button" onClick={() => { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                    <i className={`bx ${copied ? 'bx-check' : 'bx-copy'}`}></i>
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="qr-link-section">
            <p>Scan QR code or share the link to join this group</p>

            <div className="qr-code-display">
              <div className="qr-placeholder">
                <i className="bx bx-qr" style={{ fontSize: 100, color: '#1E3A8A' }}></i>
              </div>
              <span className="qr-label">Group QR Code</span>
            </div>

            <div className="divider"><span>or</span></div>

            <div className="invite-link-box">
              <input type="text" value={inviteLink} readOnly />
              <button type="button" onClick={copyLink}>
                <i className={`bx ${copied ? 'bx-check' : 'bx-copy'}`}></i>
              </button>
            </div>
            <p className="link-hint">Anyone with this link can join the group</p>
          </div>
        )}
      </div>
    </div>
  )
}