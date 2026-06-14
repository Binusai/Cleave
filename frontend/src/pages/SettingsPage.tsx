import { useState, useEffect } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { useTheme, themes } from '../context/ThemeContext'
import { fetchPreferences, updatePreferences } from '../api/settings'
import './SettingsPage.css'

export default function SettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, mode, setTheme, setMode, compactLayout, setCompactLayout, largeText, setLargeText, reducedMotion, setReducedMotion, highContrast, setHighContrast } = useTheme()
  const [prefs, setPrefs] = useState<any>({})
  const [activeSection, setActiveSection] = useState('appearance')

  useEffect(() => { loadPrefs() }, [])

const loadPrefs = async () => {
    try {
      const data = await fetchPreferences()
      setPrefs(data)
      if (data.theme) setTheme(data.theme)
      if (data.mode) setMode(data.mode)
    } catch {}
  }

  const handleToggle = async (key: string, value: any) => {
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)
    try { await updatePreferences({ [key]: value }) } catch {}
  }

  const handleThemeChange = async (name: string) => {
    setTheme(name)
    try { await updatePreferences({ theme: name }) } catch {}
  }

  const handleModeChange = async (m: 'light' | 'dark') => {
    setMode(m)
    try { await updatePreferences({ mode: m }) } catch {}
  }

  const handleLayoutToggle = (key: string, value: boolean) => {
    if (key === 'compact_layout') setCompactLayout(value)
    if (key === 'large_text') setLargeText(value)
    if (key === 'reduced_motion') setReducedMotion(value)
    if (key === 'high_contrast') setHighContrast(value)
    handleToggle(key, value)
  }

  const sections = [
    { key: 'appearance', label: 'Appearance', icon: 'bx-palette' },
    { key: 'notifications', label: 'Notifications', icon: 'bx-bell' },
    { key: 'privacy', label: 'Privacy', icon: 'bx-shield-quarter' },
    { key: 'preferences', label: 'Preferences', icon: 'bx-slider' },
    { key: 'danger', label: 'Danger Zone', icon: 'bx-error-circle' },
  ]

  return (
    <div className="dashboard">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar/>
        <div className="dashboard-content settings-page">
          <div className="settings-header">
            <div>
              <h1 className="settings-title">Settings</h1>
              <p className="settings-subtitle">Customize your Cleave experience.</p>
            </div>
          </div>

          <div className="settings-layout">
            <div className="settings-nav">
              {sections.map((s) => (
                <button key={s.key} className={`settings-nav-item ${activeSection === s.key ? 'active' : ''}`} onClick={() => setActiveSection(s.key)}>
                  <i className={`bx ${s.icon}`}></i>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <div className="settings-content">
              {activeSection === 'appearance' && (
                <div className="settings-section-card">
                  <h3>Theme</h3>
                  <p className="section-desc">Choose a theme that feels like you.</p>
                  <div className="theme-grid">
                    {themes.map((t) => (
                      <button key={t.name} className={`theme-card ${theme.name === t.name ? 'selected' : ''}`} onClick={() => handleThemeChange(t.name)} style={{ borderColor: theme.name === t.name ? t.primary : undefined }}>
                        <div className="theme-preview" style={{ background: t.gradient }}>
                          <div className="theme-preview-sidebar" style={{ background: t.primaryHover }} />
                          <div className="theme-preview-main">
                            <div className="theme-preview-bar" style={{ background: t.secondary }} />
                            <div className="theme-preview-card" />
                            <div className="theme-preview-card short" />
                          </div>
                        </div>
                        <span className="theme-name">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  <h3 style={{ marginTop: 32 }}>Mode</h3>
                  <div className="mode-toggle-row">
                    <button className={`mode-btn ${mode === 'light' ? 'active' : ''}`} onClick={() => handleModeChange('light')}>
                      <i className="bx bx-sun"></i> Light
                    </button>
                    <button className={`mode-btn ${mode === 'dark' ? 'active' : ''}`} onClick={() => handleModeChange('dark')}>
                      <i className="bx bx-moon"></i> Dark
                    </button>
                  </div>

                  <h3 style={{ marginTop: 32 }}>Layout</h3>
                  <div className="toggle-list">
                    <ToggleRow label="Compact Layout" checked={compactLayout} onChange={(v) => handleLayoutToggle('compact_layout', v)} />
                    <ToggleRow label="Large Text" checked={largeText} onChange={(v) => handleLayoutToggle('large_text', v)} />
                    <ToggleRow label="Reduced Motion" checked={reducedMotion} onChange={(v) => handleLayoutToggle('reduced_motion', v)} />
                    <ToggleRow label="High Contrast" checked={highContrast} onChange={(v) => handleLayoutToggle('high_contrast', v)} />
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="settings-section-card">
                  <h3>Notification Preferences</h3>
                  <div className="toggle-list">
                    <ToggleRow label="Email Notifications" checked={prefs.email_notifications} onChange={(v) => handleToggle('email_notifications', v)} />
                    <ToggleRow label="Push Notifications" checked={prefs.push_notifications} onChange={(v) => handleToggle('push_notifications', v)} />
                    <ToggleRow label="Settlement Reminders" checked={prefs.settlement_reminders} onChange={(v) => handleToggle('settlement_reminders', v)} />
                    <ToggleRow label="Expense Updates" checked={prefs.expense_updates} onChange={(v) => handleToggle('expense_updates', v)} />
                    <ToggleRow label="Group Activity" checked={prefs.group_activity} onChange={(v) => handleToggle('group_activity', v)} />
                    <ToggleRow label="Weekly Summary" checked={prefs.weekly_summary} onChange={(v) => handleToggle('weekly_summary', v)} />
                    <ToggleRow label="Monthly Summary" checked={prefs.monthly_summary} onChange={(v) => handleToggle('monthly_summary', v)} />
                  </div>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="settings-section-card">
                  <h3>Privacy & Security</h3>
                  <div className="form-group">
                    <label>Profile Visibility</label>
                    <select value={prefs.profile_visibility || 'members'} onChange={(e) => handleToggle('profile_visibility', e.target.value)}>
                      <option value="members">Only Group Members</option>
                      <option value="everyone">Everyone</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone Visibility</label>
                    <select value={prefs.phone_visibility || 'members'} onChange={(e) => handleToggle('phone_visibility', e.target.value)}>
                      <option value="members">Only Group Members</option>
                      <option value="everyone">Everyone</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="settings-section-card">
                  <h3>Regional Preferences</h3>
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label>Language</label>
                      <select value={prefs.language || 'en'} onChange={(e) => handleToggle('language', e.target.value)}>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label>Currency</label>
                      <select value={prefs.currency || 'INR'} onChange={(e) => handleToggle('currency', e.target.value)}>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Timezone</label>
                    <select value={prefs.timezone || 'Asia/Kolkata'} onChange={(e) => handleToggle('timezone', e.target.value)}>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="America/New_York">America/New York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                </div>
              )}

              {activeSection === 'danger' && (
                <div className="settings-section-card danger-zone">
                  <h3 style={{ color: '#DC2626' }}>Danger Zone</h3>
                  <p className="section-desc">Irreversible actions. Proceed with caution.</p>
                  <div className="danger-list">
                    <div className="danger-item">
                      <div>
                        <span className="danger-label">Deactivate Account</span>
                        <span className="danger-desc">Temporarily disable your account</span>
                      </div>
                      <button className="btn-danger-outline">Deactivate</button>
                    </div>
                    <div className="danger-item">
                      <div>
                        <span className="danger-label">Delete Account</span>
                        <span className="danger-desc">Permanently delete all your data</span>
                      </div>
                      <button className="btn-danger-filled">Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="toggle-row">
      <span className="toggle-label">{label}</span>
      <button className={`toggle-switch ${checked ? 'on' : 'off'}`} onClick={() => onChange(!checked)}>
        <span className="toggle-knob" />
      </button>
    </div>
  )
}