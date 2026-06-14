import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../../api/ai'
import './AIChatFloating.css'

export default function AIChatFloating() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setMessages((prev) => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)
    try {
      const res = await sendChatMessage(msg)
      setMessages((prev) => [...prev, { role: 'ai', text: res.text }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setOpen(!open)
    if (messages.length === 0) {
      setMessages([{ role: 'ai', text: "Hi! 👋 I'm Cleave AI. Ask me about your finances." }])
    }
  }

  return (
    <>
      <button className="fab-ai" onClick={handleOpen}>
        <i className={`bx ${open ? 'bx-x' : 'bx-bot'}`}></i>
      </button>

      {open && (
        <div className="ai-drawer">
          <div className="ai-drawer-header">
            <div>
              <i className="bx bx-bot"></i>
              <span>Cleave AI</span>
            </div>
            <button onClick={() => setOpen(false)}><i className="bx bx-x"></i></button>
          </div>
          <div className="ai-drawer-messages">
            {messages.map((m, i) => (
              <div key={i} className={`drawer-message ${m.role}`}>
                <p>{m.text}</p>
              </div>
            ))}
            {loading && (
              <div className="drawer-message ai">
                <div className="typing-dots"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="ai-drawer-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your finances..."
            />
            <button onClick={handleSend} disabled={!input.trim()}>
              <i className="bx bx-send"></i>
            </button>
          </div>
        </div>
      )}
    </>
  )
}