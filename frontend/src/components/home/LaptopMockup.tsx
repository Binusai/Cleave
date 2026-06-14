import './LaptopMockup.css'

export default function LaptopMockup() {
  return (
    <div className="laptop-wrapper">
      <div className="laptop">
        <div className="laptop-frame">
          <div className="laptop-titlebar">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="url">app.cleave.com</span>
          </div>
          <div className="laptop-screen">
            <div className="laptop-screen-placeholder">
              <div className="placeholder-logo">Cleave</div>
              <p className="placeholder-text">Dashboard preview</p>
            </div>
          </div>
        </div>
        <div className="laptop-base" />
      </div>
      <div className="laptop-shadow" />
    </div>
  )
}