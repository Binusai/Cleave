import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'
import { sendChatMessage, fetchSuggestedQuestions } from '../api/ai'
import './AIChatPage.css'

interface Message {
  role: 'user' | 'ai'
  text: string
}

export default function AIChatPage() {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm Cleave AI, your personal financial assistant. Ask me about your expenses, settlements, groups, or spending patterns." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<string[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadQuestions = async () => {
    try {
      const qs = await fetchSuggestedQuestions()
      setQuestions(qs)
    } catch {}
  }

  const handleSend = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setMessages((prev) => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)

    try {
      const response = await sendChatMessage(msg)
      setMessages((prev) => [...prev, { role: 'ai', text: response.text }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: "I'm having trouble right now. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="dashboard">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar />
        <div className="dashboard-content ai-chat-page">

          <div className="ai-sub-nav">
            <Link to="/ai/insights" className={`ai-nav-link ${location.pathname === '/ai/insights' ? 'active' : ''}`}>
              <i className="bx bx-bulb"></i> AI Insights
            </Link>
            <Link to="/ai/chat" className={`ai-nav-link ${location.pathname === '/ai/chat' ? 'active' : ''}`}>
              <i className="bx bx-bot"></i> Cleave AI
            </Link>
          </div>

          <div className="ai-header">
            <div>
              <h1 className="ai-title">Cleave AI</h1>
              <p className="ai-subtitle">Your personal financial assistant.</p>
            </div>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <div className="chat-avatar">
                    {msg.role === 'ai' ? (
                      <i className="bx bx-bot"></i>
                    ) : (
                      <span>Y</span>
                    )}
                  </div>
                  <div className="chat-bubble">
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-message ai">
                  <div className="chat-avatar"><i className="bx bx-bot"></i></div>
                  <div className="chat-bubble typing">
                    <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {messages.length <= 1 && questions.length > 0 && (
              <div className="suggested-questions">
                <span className="suggested-label">Suggested questions</span>
                <div className="suggested-grid">
                  {questions.slice(0, 6).map((q, i) => (
                    <button key={i} className="suggested-btn" onClick={() => handleSend(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="chat-input-area">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Cleave AI about your finances..."
                rows={1}
              />
              <button className="chat-send-btn" onClick={() => handleSend()} disabled={!input.trim() || loading}>
                <i className="bx bx-send"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}