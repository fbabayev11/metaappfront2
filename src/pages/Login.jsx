import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../App.jsx'
import { authAPI } from '../api.js'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data.user, res.data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <BarChart3 size={28} color="#fff" />
          </div>
          <h1 style={styles.logoText}>Meta Ads Analyzer</h1>
        </div>

        <h2 style={styles.title}>Xoş gəldiniz</h2>
        <p style={styles.subtitle}>Hesabınıza daxil olun</p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.error}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-poçt</label>
            <div style={styles.inputWrap}>
              <Mail size={16} color="#5a5a7a" style={styles.inputIcon} />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Şifrə</label>
            <div style={styles.inputWrap}>
              <Lock size={16} color="#5a5a7a" style={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{ ...styles.input, paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                {showPass ? <EyeOff size={16} color="#5a5a7a" /> : <Eye size={16} color="#5a5a7a" />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={styles.btn}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Daxil ol'}
          </motion.button>
        </form>

        <p style={styles.footer}>
          Hesabınız yoxdur?{' '}
          <Link to="/register" style={styles.link}>Qeydiyyat</Link>
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  orb1: {
    position: 'absolute', top: '-20%', left: '-10%',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-20%', right: '-10%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '32px', justifyContent: 'center',
  },
  logoIcon: {
    width: '48px', height: '48px', borderRadius: '12px',
    background: 'var(--gradient)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px var(--accent-glow)',
  },
  logoText: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' },
  title: { fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' },
  subtitle: { color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px', fontSize: '15px' },
  error: {
    background: 'rgba(255,92,122,0.1)', border: '1px solid rgba(255,92,122,0.3)',
    borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
    color: 'var(--danger)', fontSize: '14px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '12px 14px 12px 42px',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: '10px', color: 'var(--text-primary)', fontSize: '15px',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', padding: '0', lineHeight: '1',
  },
  btn: {
    padding: '14px', borderRadius: '10px',
    background: 'var(--gradient)', color: '#fff',
    fontWeight: '600', fontSize: '16px', marginTop: '8px',
    boxShadow: '0 4px 20px var(--accent-glow)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  },
  footer: { textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' },
  link: { color: 'var(--accent)', fontWeight: '500' },
}
