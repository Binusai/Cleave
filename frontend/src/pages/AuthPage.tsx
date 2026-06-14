import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'
import './AuthPage.css'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          renderButton: (element: HTMLElement, config: { theme: string; size: string; text?: string; width?: number }) => void
          prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; isDismissedMoment: () => boolean }) => void) => void
        }
      }
    }
  }
}

export default function AuthPage() {
  const { login, register, googleLogin, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [localError, setLocalError] = useState('')

  const googleButtonRef = useRef<HTMLDivElement>(null)
  const googleRegisterButtonRef = useRef<HTMLDivElement>(null)

  const [loginData, setLoginData] = useState({
    login_identifier: '',
    password: '',
  })

  const [registerData, setRegisterData] = useState({
    email: '',
    phone_number: '',
    password: '',
  })

  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false)
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false)

  useEffect(() => {
    if (error) setLocalError(error)
  }, [error])

  const handleGoogleResponse = async (response: { credential: string }) => {
    try {
      await googleLogin(response.credential)
      navigate('/dashboard')
    } catch {
      setLocalError('Google authentication failed')
    }
  }

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    const loadGoogleButton = () => {
      if (window.google?.accounts) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        })

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: 300,
          })
        }

        if (googleRegisterButtonRef.current) {
          window.google.accounts.id.renderButton(googleRegisterButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: 300,
          })
        }
      }
    }

    if (window.google?.accounts) {
      loadGoogleButton()
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(checkGoogle)
          loadGoogleButton()
        }
      }, 200)
      setTimeout(() => clearInterval(checkGoogle), 5000)
      return () => clearInterval(checkGoogle)
    }
  }, [isRegister])

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!loginData.login_identifier.trim() || !loginData.password) {
      setLocalError('All fields are required')
      return
    }
    try {
      await login(loginData)
      navigate('/dashboard')
    } catch {
      // error set by context
    }
  }

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!registerData.email.trim() || !registerData.password) {
      setLocalError('Email and password are required')
      return
    }
    const success = await register(registerData)
    if (success) {
      setShowModal(true)
      setRegisterData({ email: '', phone_number: '', password: '' })
      setLocalError('')
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setIsRegister(false)
    clearError()
    setLocalError('')
  }

  const switchToRegister = () => {
    setIsRegister(true)
    setLocalError('')
    clearError()
  }

  const switchToLogin = () => {
    setIsRegister(false)
    setLocalError('')
    clearError()
  }

  return (
    <Layout showNavActions={false}>
      <div className="auth-wrap">
        <div className={`container ${isRegister ? 'active' : ''}`}>
          <div className="form-box login">
            <form onSubmit={handleLoginSubmit}>
              <h1>Welcome back</h1>
              {localError && <div className="error-message">{localError}</div>}

              <div className="input-box">
                <input
                  type="text"
                  name="login_identifier"
                  placeholder="Email or Phone Number"
                  value={loginData.login_identifier}
                  onChange={(e) => {
                    setLoginData({ ...loginData, login_identifier: e.target.value })
                    setLocalError('')
                    clearError()
                  }}
                  required
                />
                <i className="bx bxs-user"></i>
              </div>

              <div className="input-box password-box">
                <input
                  type={loginPasswordVisible ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => {
                    setLoginData({ ...loginData, password: e.target.value })
                    setLocalError('')
                    clearError()
                  }}
                  required
                />
                <i
                  className={`bx ${loginPasswordVisible ? 'bx-show' : 'bx-hide'} toggle-password`}
                  onClick={() => setLoginPasswordVisible(!loginPasswordVisible)}
                ></i>
              </div>

              <button type="submit" className="btn">Sign In</button>

              <div className="divider"><span>or</span></div>

              <div ref={googleButtonRef} className="google-btn-wrapper"></div>
            </form>
          </div>

          <div className="form-box register">
            <form onSubmit={handleRegisterSubmit}>
              <h1>Create account</h1>
              {localError && <div className="error-message">{localError}</div>}

              <div className="input-box">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={registerData.email}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, email: e.target.value })
                    setLocalError('')
                    clearError()
                  }}
                  required
                />
                <i className="bx bxs-envelope"></i>
              </div>

              <div className="input-box">
                <input
                  type="text"
                  name="phone_number"
                  placeholder="Phone Number (optional)"
                  maxLength={15}
                  value={registerData.phone_number}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, phone_number: e.target.value })
                    setLocalError('')
                    clearError()
                  }}
                />
                <i className="bx bxs-phone"></i>
              </div>

              <div className="input-box password-box">
                <input
                  type={registerPasswordVisible ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, password: e.target.value })
                    setLocalError('')
                    clearError()
                  }}
                  required
                />
                <i
                  className={`bx ${registerPasswordVisible ? 'bx-show' : 'bx-hide'} toggle-password`}
                  onClick={() => setRegisterPasswordVisible(!registerPasswordVisible)}
                ></i>
              </div>

              <button type="submit" className="btn">Create Account</button>

              <div className="divider"><span>or</span></div>

              <div ref={googleRegisterButtonRef} className="google-btn-wrapper"></div>
            </form>
          </div>

          <div className="toggle-box">
            <div className="toggle-panel toggle-left">
              <h1>New here?</h1>
              <p>Create an account to start splitting expenses with your group.</p>
              <button className="btn register-btn" onClick={switchToRegister}>
                Create Account
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Already with us?</h1>
              <p>Sign in to pick up right where you left off.</p>
              <button className="btn login-btn" onClick={switchToLogin}>
                Sign In
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="modal" style={{ display: 'block' }} onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close-btn" onClick={closeModal}>&times;</span>
              <h2>Account created</h2>
              <p>Please sign in to continue.</p>
              <button className="btn" onClick={closeModal}>Sign In</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}