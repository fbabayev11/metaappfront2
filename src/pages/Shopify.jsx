import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout.jsx'
import {
  ShoppingBag, TrendingUp, Globe, Calendar, RefreshCw,
  Package, DollarSign, MapPin, ChevronDown, AlertCircle
} from 'lucide-react'
import { API_BASE } from '../api.js'

const token = () => localStorage.getItem('token')

const PERIODS = [
  { id: 'today',      label: 'Bu gün' },
  { id: 'yesterday',  label: 'Dünən' },
  { id: 'last_7d',    label: 'Son 7 gün' },
  { id: 'last_30d',   label: 'Son 30 gün' },
  { id: 'this_month', label: 'Bu ay' },
  { id: 'last_month', label: 'Keçən ay' },
]

const FLAG = code => {
  if (!code) return '🌍'
  const map = {
    DE:'🇩🇪',AT:'🇦🇹',CH:'🇨🇭',FR:'🇫🇷',NL:'🇳🇱',BE:'🇧🇪',IT:'🇮🇹',ES:'🇪🇸',
    PL:'🇵🇱',AZ:'🇦🇿',TR:'🇹🇷',US:'🇺🇸',GB:'🇬🇧',RU:'🇷🇺',UA:'🇺🇦',SE:'🇸🇪',
    NO:'🇳🇴',DK:'🇩🇰',FI:'🇫🇮',CZ:'🇨🇿',SK:'🇸🇰',HU:'🇭🇺',RO:'🇷🇴',BG:'🇧🇬',
    HR:'🇭🇷',SI:'🇸🇮',PT:'🇵🇹',GR:'🇬🇷',LT:'🇱🇹',LV:'🇱🇻',EE:'🇪🇪',CA:'🇨🇦',
    AU:'🇦🇺',NZ:'🇳🇿',JP:'🇯🇵',KR:'🇰🇷',CN:'🇨🇳',SG:'🇸🇬',AE:'🇦🇪',SA:'🇸🇦',
  }
  return map[code.toUpperCase()] || '🌍'
}

export default function Shopify() {
  const [period, setPeriod]       = useState('last_30d')
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [shop, setShop]           = useState('')
  const [apiKey, setApiKey]       = useState('')
  const [saved, setSaved]         = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  // Mövcud config yoxla
  useEffect(() => {
    fetch(`${API_BASE}/shopify/config`, {
      headers: { Authorization: `Bearer ${token()}` }
    }).then(r => r.json()).then(d => {
      if (d.configured) {
        setShop(d.shop || '')
        setSaved(true)
      } else {
        setShowConfig(true)
      }
    }).catch(() => setShowConfig(true))
  }, [])

  const saveConfig = async () => {
    if (!shop || !apiKey) { setError('Shop URL və API key lazımdır'); return }
    setError('')
    const r = await fetch(`${API_BASE}/shopify/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ shop: shop.trim(), api_key: apiKey.trim() })
    })
    const d = await r.json()
    if (!r.ok) { setError(d.detail || 'Xəta'); return }
    setSaved(true)
    setShowConfig(false)
    loadData()
  }

  const loadData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API_BASE}/shopify/orders?period=${period}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const d = await r.json()
      if (!r.ok) { setError(d.detail || 'Xəta'); setData(null) }
      else setData(d)
    } catch (e) { setError('Bağlantı xətası') }
    setLoading(false)
  }, [period])

  useEffect(() => { if (saved) loadData() }, [period, saved, loadData])

  const fmt = v => typeof v === 'number' ? v.toLocaleString('az-AZ', { maximumFractionDigits: 2 }) : v || '—'
  const fmtMoney = (v, cur) => `${cur || '€'}${fmt(v)}`

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#96bf48,#5b8c1a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0ff' }}>Shopify Sifarişlər</h1>
              <p style={{ fontSize: 13, color: '#64748b' }}>{shop || 'Mağaza qoşulmayıb'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowConfig(c => !c)}
              style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚙️ Konfiqurasiya
            </button>
            {saved && (
              <button onClick={loadData} disabled={loading}
                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#96bf48,#5b8c1a)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                Yenilə
              </button>
            )}
          </div>
        </div>

        {/* Config Panel */}
        <AnimatePresence>
          {showConfig && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: 24, padding: 24, borderRadius: 16, background: 'rgba(150,191,72,0.08)', border: '1px solid rgba(150,191,72,0.2)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#96bf48', marginBottom: 16 }}>🔑 Shopify Bağlantısı</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Shop URL (məs: mystore.myshopify.com)</label>
                  <input value={shop} onChange={e => setShop(e.target.value)}
                    placeholder="mystore.myshopify.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Admin API Access Token</label>
                  <input value={apiKey} onChange={e => setApiKey(e.target.value)} type="password"
                    placeholder="shpat_xxxxxxxxxxxx"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14 }} />
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#475569', marginBottom: 14 }}>
                Shopify Admin → Settings → Apps and sales channels → Develop apps → Create app → Admin API scopes: <strong style={{ color: '#96bf48' }}>read_orders, read_customers</strong>
              </p>
              {error && <div style={{ color: '#f43f5e', fontSize: 13, marginBottom: 12 }}>⚠ {error}</div>}
              <button onClick={saveConfig}
                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#96bf48,#5b8c1a)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Qoş və Yüklə
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Period selector */}
        {saved && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {PERIODS.map(p => (
              <motion.button key={p.id} onClick={() => setPeriod(p.id)}
                whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.96 }}
                style={{ padding: '8px 18px', borderRadius: 20, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  background: period === p.id ? 'linear-gradient(135deg,#96bf48,#5b8c1a)' : 'rgba(255,255,255,0.06)',
                  color: period === p.id ? '#fff' : '#94a3b8',
                  boxShadow: period === p.id ? '0 4px 16px rgba(150,191,72,0.3)' : 'none' }}>
                {p.label}
              </motion.button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !showConfig && (
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(150,191,72,0.2)', borderTopColor: '#96bf48', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .shopify-row { transition: background 0.2s; }
          .shopify-row:hover { background: rgba(150,191,72,0.06) !important; }
          .shopify-stat-card { transition: border-color 0.3s, box-shadow 0.3s; }
          .shopify-stat-card:hover { border-color: rgba(150,191,72,0.3) !important; box-shadow: 0 4px 24px rgba(150,191,72,0.08); }
          .period-btn { transition: all 0.2s; }
          .period-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        `}</style>
          </div>
        )}

        {/* Data */}
        {data && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              {[
                { icon: Package,    label: 'Ümumi Sifariş',    value: data.total_orders,                color: '#96bf48' },
                { icon: DollarSign, label: 'Cəmi Gəlir',       value: fmtMoney(data.total_revenue, data.currency), color: '#00d4aa' },
                { icon: TrendingUp, label: 'Ort. Sifariş Dəy.', value: fmtMoney(data.avg_order_value, data.currency), color: '#6c63ff' },
                { icon: Globe,      label: 'Ölkə Sayı',        value: data.countries?.length || 0,      color: '#f59e0b' },
              ].map(({ icon: Icon, label, value, color }) => (
                <motion.div key={label}
                  whileHover={{ scale: 1.04, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ padding: '20px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.07)`, cursor: 'default',
                    boxShadow: '0 0 0 rgba(0,0,0,0)', transition: 'box-shadow 0.3s, border-color 0.3s' }}
                  onHoverStart={e => { e.target.style && (e.target.style.borderColor = color + '50') }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={color} />
                    </div>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</span>
                  </div>
                  <motion.div animate={{ opacity: [0.7,1,0.7] }} transition={{ duration: 3, repeat: Infinity, ease:'easeInOut' }}
                  style={{ fontSize: 26, fontWeight: 800, color: '#f0f0ff' }}>{value}</motion.div>
                </motion.div>
              ))}
            </div>

            {/* ── QRAFİKLƏR ─────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

              {/* Ölkə Pie Chart */}
              <motion.div whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(150,191,72,0.12)' }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <Globe size={16} color="#96bf48" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Ölkə üzrə Bölgü</h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={(data.countries||[]).slice(0,8)}
                      dataKey="count"
                      nameKey="country_name"
                      cx="50%" cy="50%"
                      outerRadius={95}
                      innerRadius={58}
                      paddingAngle={3}
                      activeOuterRadius={108}
                      label={false}
                    >
                      {(data.countries||[]).slice(0,8).map((_, i) => (
                        <Cell key={i} fill={['#96bf48','#6c63ff','#00d4aa','#f59e0b','#f43f5e','#06b6d4','#a855f7','#10b981'][i % 8]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background:'#0a0a14', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, fontSize:13, padding:'10px 14px' }}
                      formatter={(v, n, props) => [`${v} sifariş`, props.payload.country_name || props.payload.country_code]}
                      labelFormatter={() => ''}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Günlük Area Chart */}
              <motion.div whileHover={{ scale: 1.01, boxShadow: '0 8px 40px rgba(108,99,255,0.12)' }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <TrendingUp size={16} color="#6c63ff" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Günlük Gəlir Trendi</h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.daily||[]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#96bf48" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#96bf48" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false}
                      tickFormatter={d => d.slice(5)} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background:'#0a0a14', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:12 }}
                      formatter={(v, n) => [n==='revenue' ? `${data.currency}${v.toFixed(2)}` : v, n==='revenue' ? 'Gəlir' : 'Sifariş']}
                      labelFormatter={l => `📅 ${l}`}
                    />
                    <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#6c63ff" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                    <Area yAxisId="left" type="monotone" dataKey="count" stroke="#96bf48" fill="url(#ordGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* ── KÖHNƏLƏRİ SAXLA ─────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              {/* Ölkə üzrə */}
              <div style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <MapPin size={16} color="#96bf48" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Ölkə üzrə Sifarişlər</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(data.countries || []).slice(0, 12).map((c, i) => {
                    const pct = data.total_orders > 0 ? (c.count / data.total_orders * 100) : 0
                    return (
                      <motion.div key={c.country_code || i}
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{ padding: '6px 8px', borderRadius: 8, cursor: 'default' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 18 }}>{FLAG(c.country_code)}</span>
                            {c.country_name || c.country_code || 'Naməlum'}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#96bf48' }}>
                            {c.count} <span style={{ color: '#475569', fontWeight: 400 }}>({pct.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div style={{ height: 5, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                            style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg,#96bf48,#5b8c1a)` }} />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Günlük/Aylıq qrafik */}
              <div style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <Calendar size={16} color="#6c63ff" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>Günlük Sifarişlər</h3>
                </div>
                {(data.daily || []).length === 0 ? (
                  <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Məlumat yoxdur</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                    {(data.daily || []).map((d, i) => {
                      const max = Math.max(...data.daily.map(x => x.count))
                      const pct = max > 0 ? (d.count / max * 100) : 0
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, color: '#64748b', width: 70, flexShrink: 0 }}>{d.date}</span>
                          <div style={{ flex: 1, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.02 }}
                              style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#6c63ff,#a855f7)', position: 'absolute' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', width: 24, textAlign: 'right' }}>{d.count}</span>
                          <span style={{ fontSize: 11, color: '#64748b', width: 70, textAlign: 'right' }}>{fmtMoney(d.revenue, data.currency)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Son sifarişlər */}
            <div style={{ padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 16 }}>Son Sifarişlər</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0 }}>
                {['Müştəri', 'Ölkə', 'Məbləğ', 'Status', 'Tarix'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#475569', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</div>
                ))}
                {(data.recent_orders || []).map((o, i) => (
                  <React.Fragment key={i}>
                    <motion.div whileHover={{ background: 'rgba(150,191,72,0.06)', x: 2 }}
                    style={{ fontSize: 13, color: '#e2e8f0', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', borderRadius: 6 }}>
                      {o.customer || 'Anonim'}
                    </motion.div>
                    <div style={{ fontSize: 13, color: '#94a3b8', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {FLAG(o.country_code)} {o.country_code || '—'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#96bf48', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {fmtMoney(o.total, data.currency)}
                    </div>
                    <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        background: o.status === 'paid' ? 'rgba(0,212,170,0.15)' : o.status === 'pending' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
                        color: o.status === 'paid' ? '#00d4aa' : o.status === 'pending' ? '#f59e0b' : '#64748b' }}>
                        {o.status === 'paid' ? 'Ödənilib' : o.status === 'pending' ? 'Gözləyir' : o.status || '—'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      {o.date ? new Date(o.date).toLocaleDateString('az-AZ') : '—'}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {!saved && !showConfig && !loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
            <p>Shopify mağazanızı qoşun</p>
          </div>
        )}
      </motion.div>
    </Layout>
  )
}
