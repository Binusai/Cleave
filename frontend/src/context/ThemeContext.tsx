import { createContext, useState, useEffect, useContext, type ReactNode } from 'react'

interface Theme {
  name: string
  label: string
  primary: string
  primaryHover: string
  secondary: string
  gradient: string
  // Light mode tints
  lightBg: string
  lightCardBg: string
  lightBorder: string
  lightHoverBg: string
  lightInputBg: string
  lightSubtle: string
  lightSidebarBg: string
  lightSidebarText: string
  lightSidebarActive: string
  lightAccentBg: string
  lightAccentLight: string
  // Dark mode tints
  darkBg: string
  darkCardBg: string
  darkBorder: string
  darkHoverBg: string
  darkInputBg: string
  darkSubtle: string
  darkSidebarBg: string
  darkSidebarText: string
  darkSidebarActive: string
  darkAccentBg: string
  darkAccentLight: string
}

export const themes: Theme[] = [
  {
    name: 'default',
    label: 'Default',
    primary: '#1E3A8A',
    primaryHover: '#1E40AF',
    secondary: '#3B82F6',
    gradient: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
    // Light - clean white with subtle blue tint
    lightBg: '#F8FAFC',
    lightCardBg: '#FFFFFF',
    lightBorder: '#E2E8F0',
    lightHoverBg: '#F1F5F9',
    lightInputBg: '#F8FAFC',
    lightSubtle: '#F1F5F9',
    lightSidebarBg: '#FFFFFF',
    lightSidebarText: '#334155',
    lightSidebarActive: 'rgba(30, 58, 138, 0.08)',
    lightAccentBg: 'rgba(59, 130, 246, 0.06)',
    lightAccentLight: '#DBEAFE',
    // Dark - deep navy
    darkBg: '#0F172A',
    darkCardBg: '#1E293B',
    darkBorder: '#334155',
    darkHoverBg: '#293548',
    darkInputBg: '#1E293B',
    darkSubtle: '#283444',
    darkSidebarBg: '#0F172A',
    darkSidebarText: '#94A3B8',
    darkSidebarActive: 'rgba(59, 130, 246, 0.15)',
    darkAccentBg: 'rgba(59, 130, 246, 0.10)',
    darkAccentLight: '#1E3A5F',
  },
  {
    name: 'cleave-blue',
    label: 'Cleave Blue',
    primary: '#1E3A5F',
    primaryHover: '#16304D',
    secondary: '#2563EB',
    gradient: 'linear-gradient(135deg, #1E3A5F, #2563EB)',
    lightBg: '#F6F9FC',
    lightCardBg: '#FFFFFF',
    lightBorder: '#D8E4F0',
    lightHoverBg: '#EDF2F8',
    lightInputBg: '#F6F9FC',
    lightSubtle: '#EDF2F8',
    lightSidebarBg: '#F0F5FB',
    lightSidebarText: '#2C4A6E',
    lightSidebarActive: 'rgba(30, 58, 95, 0.10)',
    lightAccentBg: 'rgba(37, 99, 235, 0.06)',
    lightAccentLight: '#DBEAFE',
    darkBg: '#0B1929',
    darkCardBg: '#132338',
    darkBorder: '#1E3650',
    darkHoverBg: '#1A3050',
    darkInputBg: '#132338',
    darkSubtle: '#182D45',
    darkSidebarBg: '#091525',
    darkSidebarText: '#7DA3C9',
    darkSidebarActive: 'rgba(37, 99, 235, 0.18)',
    darkAccentBg: 'rgba(37, 99, 235, 0.12)',
    darkAccentLight: '#1E3A5F',
  },
  {
    name: 'emerald',
    label: 'Emerald',
    primary: '#166534',
    primaryHover: '#14532D',
    secondary: '#22C55E',
    gradient: 'linear-gradient(135deg, #166534, #22C55E)',
    lightBg: '#F5FBF7',
    lightCardBg: '#FFFFFF',
    lightBorder: '#D1E7D8',
    lightHoverBg: '#E8F5EC',
    lightInputBg: '#F5FBF7',
    lightSubtle: '#E8F5EC',
    lightSidebarBg: '#EFF8F2',
    lightSidebarText: '#1A5C32',
    lightSidebarActive: 'rgba(22, 101, 52, 0.10)',
    lightAccentBg: 'rgba(34, 197, 94, 0.06)',
    lightAccentLight: '#DCFCE7',
    darkBg: '#071A0F',
    darkCardBg: '#0F2A1A',
    darkBorder: '#1A3D25',
    darkHoverBg: '#163A22',
    darkInputBg: '#0F2A1A',
    darkSubtle: '#133220',
    darkSidebarBg: '#061508',
    darkSidebarText: '#6CC98A',
    darkSidebarActive: 'rgba(34, 197, 94, 0.18)',
    darkAccentBg: 'rgba(34, 197, 94, 0.12)',
    darkAccentLight: '#166534',
  },
  {
    name: 'royal-purple',
    label: 'Royal Purple',
    primary: '#5B21B6',
    primaryHover: '#4C1D95',
    secondary: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #5B21B6, #8B5CF6)',
    lightBg: '#F9F6FE',
    lightCardBg: '#FFFFFF',
    lightBorder: '#DDD4F0',
    lightHoverBg: '#F0EAF8',
    lightInputBg: '#F9F6FE',
    lightSubtle: '#F0EAF8',
    lightSidebarBg: '#F3EEFA',
    lightSidebarText: '#4C1D95',
    lightSidebarActive: 'rgba(91, 33, 182, 0.10)',
    lightAccentBg: 'rgba(139, 92, 246, 0.06)',
    lightAccentLight: '#EDE9FE',
    darkBg: '#120B24',
    darkCardBg: '#1C1236',
    darkBorder: '#2E1F50',
    darkHoverBg: '#261A45',
    darkInputBg: '#1C1236',
    darkSubtle: '#221740',
    darkSidebarBg: '#0E0820',
    darkSidebarText: '#A78BFA',
    darkSidebarActive: 'rgba(139, 92, 246, 0.18)',
    darkAccentBg: 'rgba(139, 92, 246, 0.12)',
    darkAccentLight: '#5B21B6',
  },
  {
    name: 'slate',
    label: 'Slate',
    primary: '#334155',
    primaryHover: '#1E293B',
    secondary: '#64748B',
    gradient: 'linear-gradient(135deg, #334155, #64748B)',
    lightBg: '#F7F8FA',
    lightCardBg: '#FFFFFF',
    lightBorder: '#DDE1E7',
    lightHoverBg: '#ECEEF2',
    lightInputBg: '#F7F8FA',
    lightSubtle: '#ECEEF2',
    lightSidebarBg: '#F0F2F5',
    lightSidebarText: '#475569',
    lightSidebarActive: 'rgba(51, 65, 85, 0.10)',
    lightAccentBg: 'rgba(100, 116, 139, 0.06)',
    lightAccentLight: '#E2E8F0',
    darkBg: '#0F1215',
    darkCardBg: '#1A1E24',
    darkBorder: '#2A3038',
    darkHoverBg: '#242A32',
    darkInputBg: '#1A1E24',
    darkSubtle: '#20262E',
    darkSidebarBg: '#0C0F12',
    darkSidebarText: '#94A3B8',
    darkSidebarActive: 'rgba(100, 116, 139, 0.18)',
    darkAccentBg: 'rgba(100, 116, 139, 0.12)',
    darkAccentLight: '#334155',
  },
  {
    name: 'teal',
    label: 'Teal',
    primary: '#0F766E',
    primaryHover: '#115E59',
    secondary: '#14B8A6',
    gradient: 'linear-gradient(135deg, #0F766E, #14B8A6)',
    lightBg: '#F4FBFA',
    lightCardBg: '#FFFFFF',
    lightBorder: '#CCE7E4',
    lightHoverBg: '#E2F4F1',
    lightInputBg: '#F4FBFA',
    lightSubtle: '#E2F4F1',
    lightSidebarBg: '#ECF7F5',
    lightSidebarText: '#0E6B64',
    lightSidebarActive: 'rgba(15, 118, 110, 0.10)',
    lightAccentBg: 'rgba(20, 184, 166, 0.06)',
    lightAccentLight: '#CCFBF1',
    darkBg: '#071715',
    darkCardBg: '#0F2825',
    darkBorder: '#183C38',
    darkHoverBg: '#143533',
    darkInputBg: '#0F2825',
    darkSubtle: '#12302D',
    darkSidebarBg: '#051210',
    darkSidebarText: '#5EEAD4',
    darkSidebarActive: 'rgba(20, 184, 166, 0.18)',
    darkAccentBg: 'rgba(20, 184, 166, 0.12)',
    darkAccentLight: '#0F766E',
  },
  {
    name: 'burgundy',
    label: 'Burgundy',
    primary: '#7F1D1D',
    primaryHover: '#991B1B',
    secondary: '#DC2626',
    gradient: 'linear-gradient(135deg, #7F1D1D, #DC2626)',
    lightBg: '#FDF6F6',
    lightCardBg: '#FFFFFF',
    lightBorder: '#F0D4D4',
    lightHoverBg: '#F8E8E8',
    lightInputBg: '#FDF6F6',
    lightSubtle: '#F8E8E8',
    lightSidebarBg: '#FBF0F0',
    lightSidebarText: '#7F1D1D',
    lightSidebarActive: 'rgba(127, 29, 29, 0.10)',
    lightAccentBg: 'rgba(220, 38, 38, 0.06)',
    lightAccentLight: '#FEE2E2',
    darkBg: '#1A0A0A',
    darkCardBg: '#2A1212',
    darkBorder: '#3D1B1B',
    darkHoverBg: '#351818',
    darkInputBg: '#2A1212',
    darkSubtle: '#301515',
    darkSidebarBg: '#140808',
    darkSidebarText: '#FCA5A5',
    darkSidebarActive: 'rgba(220, 38, 38, 0.18)',
    darkAccentBg: 'rgba(220, 38, 38, 0.12)',
    darkAccentLight: '#7F1D1D',
  },
]

interface ThemeContextType {
  theme: Theme
  mode: 'light' | 'dark'
  setTheme: (name: string) => void
  setMode: (mode: 'light' | 'dark') => void
  compactLayout: boolean
  setCompactLayout: (v: boolean) => void
  largeText: boolean
  setLargeText: (v: boolean) => void
  reducedMotion: boolean
  setReducedMotion: (v: boolean) => void
  highContrast: boolean
  setHighContrast: (v: boolean) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes[0],
  mode: 'light',
  setTheme: () => {},
  setMode: () => {},
  compactLayout: false,
  setCompactLayout: () => {},
  largeText: false,
  setLargeText: () => {},
  reducedMotion: false,
  setReducedMotion: () => {},
  highContrast: false,
  setHighContrast: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState(localStorage.getItem('cleave_theme') || 'default')
  const [mode, setModeState] = useState<'light' | 'dark'>(
    (localStorage.getItem('cleave_mode') as 'light' | 'dark') || 'light'
  )
  const [compactLayout, setCompactLayoutState] = useState(localStorage.getItem('cleave_compact') === 'true')
  const [largeText, setLargeTextState] = useState(localStorage.getItem('cleave_large_text') === 'true')
  const [reducedMotion, setReducedMotionState] = useState(localStorage.getItem('cleave_reduced_motion') === 'true')
  const [highContrast, setHighContrastState] = useState(localStorage.getItem('cleave_high_contrast') === 'true')

  const theme = themes.find((t) => t.name === themeName) || themes[0]

  useEffect(() => {
    const root = document.documentElement
    const isLight = mode === 'light'

    // ===== Unified theme+mode colors =====
    // Page backgrounds
    root.style.setProperty('--bg', isLight ? theme.lightBg : theme.darkBg)
    root.style.setProperty('--card-bg', isLight ? theme.lightCardBg : theme.darkCardBg)
    root.style.setProperty('--border', isLight ? theme.lightBorder : theme.darkBorder)
    root.style.setProperty('--hover-bg', isLight ? theme.lightHoverBg : theme.darkHoverBg)
    root.style.setProperty('--input-bg', isLight ? theme.lightInputBg : theme.darkInputBg)
    root.style.setProperty('--subtle-border', isLight ? theme.lightSubtle : theme.darkSubtle)

    // Sidebar
    root.style.setProperty('--sidebar-bg', isLight ? theme.lightSidebarBg : theme.darkSidebarBg)
    root.style.setProperty('--sidebar-text', isLight ? theme.lightSidebarText : theme.darkSidebarText)
    root.style.setProperty('--sidebar-active-bg', isLight ? theme.lightSidebarActive : theme.darkSidebarActive)

    // Text
    root.style.setProperty('--text', isLight ? '#0F172A' : '#F1F5F9')
    root.style.setProperty('--text-secondary', isLight ? '#64748B' : '#94A3B8')

    // Theme-specific
    root.style.setProperty('--primary', theme.primary)
    root.style.setProperty('--primary-hover', theme.primaryHover)
    root.style.setProperty('--secondary', theme.secondary)
    root.style.setProperty('--primary-gradient', theme.gradient)
    root.style.setProperty('--button-gradient', theme.gradient)
    root.style.setProperty('--accent-bg', isLight ? theme.lightAccentBg : theme.darkAccentBg)
    root.style.setProperty('--accent-light', isLight ? theme.lightAccentLight : theme.darkAccentLight)
    root.style.setProperty('--active-bg', isLight ? theme.lightSidebarActive : theme.darkSidebarActive)
    root.style.setProperty('--active-text', theme.primary)

    // Semantic colors
    root.style.setProperty('--shadow-color', isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(0, 0, 0, 0.4)')
    root.style.setProperty('--skeleton', isLight ? theme.lightBorder : theme.darkBorder)
    root.style.setProperty('--danger-bg', isLight ? '#FEF2F2' : '#3B1111')
    root.style.setProperty('--danger-border', isLight ? '#FECACA' : '#7F1D1D')
    root.style.setProperty('--success-bg', isLight ? '#ECFDF5' : '#0B3D2E')
    root.style.setProperty('--warning-bg', isLight ? '#FEF3C7' : '#3D2E0B')
    root.style.setProperty('--info-bg', isLight ? '#EFF6FF' : '#1E3A5F')

    // Body
    document.body.style.background = isLight ? theme.lightBg : theme.darkBg
    document.body.style.color = isLight ? '#0F172A' : '#F1F5F9'

    // Layout preferences
    root.setAttribute('data-compact', compactLayout ? 'true' : 'false')
    root.setAttribute('data-large-text', largeText ? 'true' : 'false')
    root.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false')
    root.setAttribute('data-high-contrast', highContrast ? 'true' : 'false')
  }, [themeName, mode, theme, compactLayout, largeText, reducedMotion, highContrast])

  const setTheme = (name: string) => {
    setThemeName(name)
    localStorage.setItem('cleave_theme', name)
  }

  const setMode = (m: 'light' | 'dark') => {
    setModeState(m)
    localStorage.setItem('cleave_mode', m)
  }

  const setCompactLayout = (v: boolean) => {
    setCompactLayoutState(v)
    localStorage.setItem('cleave_compact', String(v))
  }

  const setLargeText = (v: boolean) => {
    setLargeTextState(v)
    localStorage.setItem('cleave_large_text', String(v))
  }

  const setReducedMotion = (v: boolean) => {
    setReducedMotionState(v)
    localStorage.setItem('cleave_reduced_motion', String(v))
  }

  const setHighContrast = (v: boolean) => {
    setHighContrastState(v)
    localStorage.setItem('cleave_high_contrast', String(v))
  }

  return (
    <ThemeContext.Provider value={{
      theme, mode, setTheme, setMode,
      compactLayout, setCompactLayout,
      largeText, setLargeText,
      reducedMotion, setReducedMotion,
      highContrast, setHighContrast,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}