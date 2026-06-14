import { useEffect, useRef } from 'react'
import './AbstractShapes.css'

export default function AbstractShapes() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      const shapes = container.querySelectorAll('.abstract-shape')
      shapes.forEach((shape, i) => {
        const speed = 15 + i * 8
        const el = shape as HTMLElement
        el.style.transform = `translate(${x * speed}px, ${y * speed}px)`
      })
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      const shapes = container.querySelectorAll('.abstract-shape')
      shapes.forEach((shape, i) => {
        const speed = 0.02 + i * 0.015
        const el = shape as HTMLElement
        el.style.transform = `translateY(${scrollY * speed}px)`
      })
    }

    container.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="abstract-shapes" ref={containerRef}>
      <div className="abstract-shape shape-ribbon-1" />
      <div className="abstract-shape shape-ribbon-2" />
      <div className="abstract-shape shape-circle-1" />
      <div className="abstract-shape shape-circle-2" />
      <div className="abstract-shape shape-line-1" />
      <div className="abstract-shape shape-line-2" />
      <div className="abstract-shape shape-dot-grid" />
      <div className="abstract-shape shape-balance" />
    </div>
  )
}