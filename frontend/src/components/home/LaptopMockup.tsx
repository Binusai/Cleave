import { forwardRef, useEffect, useState } from 'react'
import laptopFrame from '../../assets/laptop.png'
import './LaptopMockup.css'

import slide1 from '../../assets/dashboard/slide-1.png'
import slide2 from '../../assets/dashboard/slide-2.png'
import slide3 from '../../assets/dashboard/slide-3.png'
import slide4 from '../../assets/dashboard/slide-4.png'

const slides: string[] = [slide1, slide2, slide3, slide4]

const LaptopMockup = forwardRef<HTMLDivElement>((_, ref) => {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="laptop-wrapper" ref={ref}>
      <div className="laptop">
        
        {/* Frame image FIRST — it sets the height of .laptop */}
        <img
          src={laptopFrame}
          alt="Laptop Frame"
          className="laptop-frame-image"
        />

        {/* Screen overlaid on top via absolute positioning */}
        <div className="laptop-screen">
          {slides.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Dashboard preview ${i + 1}`}
              className={`laptop-slide ${i === activeSlide ? 'active' : ''}`}
            />
          ))}
        </div>

      </div>
      <div className="laptop-shadow" />
      <div className="laptop-glow" />
    </div>
  )
})

LaptopMockup.displayName = 'LaptopMockup'
export default LaptopMockup
