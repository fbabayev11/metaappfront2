import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, LayoutDashboard, PlusCircle, LogOut, User, BookOpen, Facebook, ShoppingBag, Link2, Settings } from 'lucide-react'
import { useAuth } from '../App.jsx'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Panel' },
    { path: '/fb-analyze', icon: Facebook, label: 'API Analiz' },
    { path: '/analyze', icon: PlusCircle, label: 'Manual Analiz' },
    { path: '/shopify', icon: ShoppingBag, label: 'Shopify' },
    { path: '/shopify-utm', icon: Link2, label: 'UTM İzləmə' },
    { path: '/settings', icon: Settings, label: '⚙ Ayarlar' },
    { path: '/glossary', icon: BookOpen, label: 'Sözlük' },
  ]

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={styles.sidebar}
      >
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIcon}><BarChart3 size={22} color="#fff" /></div>
          <span style={styles.logoText}>Meta Ads</span>
        </div>

        <nav style={styles.nav}>
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} style={{
              ...styles.navItem,
              ...(location.pathname === path ? styles.navItemActive : {})
            }}>
              <Icon size={18} />
              <span>{label}</span>
              {location.pathname === path && (
                <motion.div layoutId="activeNav" style={styles.activeIndicator} />
              )}
            </Link>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              <User size={16} color="#fff" />
            </div>
            <div>
              <div style={styles.userName}>{user?.name}</div>
              <div style={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Çıxış">
            <LogOut size={18} />
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' },
  sidebar: {
    width: '240px', minHeight: '100vh', background: 'rgba(13,13,26,0.92)', backdropFilter: 'blur(12px)',
    borderRight: '1px solid var(--border)', display: 'flex',
    flexDirection: 'column', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh', zIndex: 1,
  },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' },
  logoIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: '700', fontSize: '16px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
    borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: '500',
    fontSize: '14px', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
  },
  navItemActive: { color: 'var(--text-primary)', background: 'rgba(108,99,255,0.15)' },
  activeIndicator: {
    position: 'absolute', left: 0, top: '20%', bottom: '20%',
    width: '3px', borderRadius: '3px', background: 'var(--accent)',
  },
  sidebarBottom: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px' },
  avatar: { width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 },
  userName: { fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: { background: 'none', padding: '6px', borderRadius: '8px', color: 'var(--text-muted)', flexShrink: 0, display: 'flex', transition: 'color 0.2s' },
  main: { position: 'relative', zIndex: 1, background: 'transparent', flex: 1, padding: '32px', overflowY: 'auto', maxWidth: 'calc(100vw - 240px)' },
}
