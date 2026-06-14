import { type ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
  showNavActions?: boolean
}

export default function Layout({ children, showNavActions = true }: LayoutProps) {
  return (
    <>
      <Navbar showActions={showNavActions} />
      <main>{children}</main>
      <Footer />
    </>
  )
}