import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { useAuth } from '../App.jsx'
import api from '../api.js'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/register', { name, email, password })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Qeydiyyat zamanı xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 400, padding: 40, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <UserPlus size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Qeydiyyat</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Yeni hesab yarat</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { icon: User, placeholder: 'Ad Soyad', value: name, setter: setName, type: 'text' },
            { icon: Mail, placeholder: 'E-poçt', value: email, setter: setEmail, type: 'email' },
            { icon: Lock, placeholder: 'Şifrə', value: password, setter: setPassword, type: 'password' },
          ].map(({ icon: Icon, placeholder, value, setter, type }) => (
            <div key={placeholder} style={{ position: 'relative', marginBottom: 14 }}>
              <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type={type} placeholder={placeholder} value={value} onChange={e => setter(e.target.value)} required
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,92,122,0.1)', border: '1px solid rgba(255,92,122,0.3)', borderRadius: 10, color: '#ff5c7a', fontSize: 13, marginBottom: 14 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 10, background: 'var(--gradient)', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 16 }}>
            {loading ? 'Gözləyin...' : 'Qeydiyyatdan Keç'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          Hesabın var? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Daxil ol</Link>
        </p>
      </motion.div>
    </div>
  )
}
