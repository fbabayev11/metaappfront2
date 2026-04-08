import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Facebook, Bot, CheckCircle, AlertCircle, Loader2, Calendar, User, Info, Link, Target, ShoppingBag, DollarSign } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import api from '../api.js'

const AI_PROVIDERS = [
  { id: 'openai',   name: 'OpenAI',   color: '#10a37f' },
  { id: 'claude',   name: 'Claude',   color: '#d4a27f' },
  { id: 'gemini',   name: 'Gemini',   color: '#4285f4' },
  { id: 'deepseek', name: 'DeepSeek', color: '#6c63ff' },
  { id: 'kimi',     name: 'Kimi K2',  color: '#ff6b6b' },
]

const DATE_PRESETS = [
  { id: 'today',      label: 'Bu gün' },
  { id: 'yesterday',  label: 'Dünən' },
  { id: 'last_7d',    label: 'Son 7 gün' },
  { id: 'last_14d',   label: 'Son 14 gün' },
  { id: 'last_30d',   label: 'Son 30 gün' },
  { id: 'this_month', label: 'Bu ay' },
  { id: 'last_month', label: 'Keçən ay' },
]

const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'USD', symbol: '$', label: 'Dollar ($)' },
  { code: 'TRY', symbol: '₺', label: 'Türk Lirəsi (₺)' },
  { code: 'AZN', symbol: '₼', label: 'Manat (₼)' },
  { code: 'GBP', symbol: '£', label: 'Sterlinq (£)' },
  { code: 'CHF', symbol: '₣', label: 'İsviçrə Frankı (₣)' },
  { code: 'CAD', symbol: 'C$', label: 'Kanada Dolları (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'Avstraliya Dolları (A$)' },
]

const CAMPAIGN_OBJECTIVES = [
  'Satış (Purchases)', 'Trafik (Traffic)', 'Potensial Müştəri (Lead Gen)',
  'Marka Tanınırlığı (Awareness)', 'Video Görüntülənmə', 'Mesaj (Messages)',
  'Tətbiq Yükləmə (App Install)', 'Mağaza Trafiki (Store Traffic)',
]

const MARKETS = [
  { id: 'tr',    label: '🇹🇷 Türkiyə' },
  { id: 'eu_us', label: '🌍 AB/ABŞ' },
]

export default function FacebookAnalyze() {
  const [datePreset, setDatePreset]   = useState('last_30d')
  const datePresetRef                 = useRef('last_30d')
  const [market, setMarket]           = useState('eu_us')
  const [provider, setProvider]       = useState('deepseek')
  const [accounts, setAccounts]       = useState([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const selectedAccountRef            = useRef('')
  const [campaigns, setCampaigns]     = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const selectedCampaignRef           = useRef('')
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError]             = useState('')

  // Kampaniya məlumatları
  const [campaignInfo, setCampaignInfo] = useState({
    objective: '',
    product_desc: '',
    product_link: '',
    target_audience: '',
    currency: 'EUR',
    notes: '',
  })

  const navigate = useNavigate()

  useEffect(() => {
    setLoadingAccounts(true)
    api.get('/fb/accounts')
      .then(res => {
        const accs = res.data.accounts || []
        setAccounts(accs)
        if (accs.length > 0) {
          setSelectedAccount(accs[0].id)
          selectedAccountRef.current = accs[0].id
          loadCampaigns(accs[0].id)
        }
      })
      .catch(err => setError(err.response?.data?.detail || 'Hesablar yüklənmədi'))
      .finally(() => setLoadingAccounts(false))
  }, [])

  const loadCampaigns = (accountId) => {
    setLoadingCampaigns(true)
    setCampaigns([])
    setSelectedCampaign('')
    selectedCampaignRef.current = ''
    api.get(`/fb/campaigns?account_id=${accountId}`)
      .then(res => setCampaigns(res.data.campaigns || []))
      .catch(err => setError(err.response?.data?.detail || 'Kampaniyalar yüklənmədi'))
      .finally(() => setLoadingCampaigns(false))
  }

  const handleAccountSelect = (acc) => {
    setSelectedAccount(acc.id)
    selectedAccountRef.current = acc.id
    loadCampaigns(acc.id)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!selectedCampaignRef.current) { setError('Kampaniya seçin'); return }
    setError(''); setLoading(true)

    try {
      const levels = [
        { id: 'campaign', label: 'Kampaniya analiz edilir...' },
        { id: 'adset',    label: 'Ad Set analiz edilir...' },
        { id: 'ad',       label: 'Kreativlər analiz edilir...' },
      ]
      const ids = {}
      // 3 analizi birləşdirmək üçün unique group ID
      const groupId = `grp_${Date.now()}`

      for (const lv of levels) {
        setLoadingStep(lv.label)
        const form = new FormData()
        form.append('level', lv.id)
        form.append('date_preset', datePresetRef.current)
        form.append('campaign_id', selectedCampaignRef.current)
        form.append('account_id', selectedAccountRef.current)
        form.append('ai_provider', provider)
        form.append('api_key', 'USE_ENV')
        form.append('market', market)
        form.append('campaign_info', JSON.stringify(campaignInfo))
        form.append('group_id', groupId)
        const res = await api.post('/fb/analyze', form)
        ids[lv.id] = res.data.analysis_id
      }

      navigate(`/results-combined/${ids.campaign}/${ids.adset}/${ids.ad}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analiz zamanı xəta baş verdi')
    } finally {
      setLoading(false)
      setLoadingStep('')
    }
  }

  const updateInfo = (key, val) => setCampaignInfo(prev => ({ ...prev, [key]: val }))
  const cur = CURRENCIES.find(c => c.code === campaignInfo.currency)

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={styles.header}>
        <div style={styles.fbIcon}><Facebook size={24} color="#fff" /></div>
        <div>
          <h1 style={styles.pageTitle}>Facebook-dan Analiz</h1>
          <p style={styles.subtitle}>Kampaniya seçin — Campaign + Ad Set + Kreativ analiz edilər</p>
        </div>
      </motion.div>

      {/* Hesab seçimi */}
      {accounts.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
          <div style={styles.cardHeader}><User size={15} color="var(--accent)" /><h2 style={styles.cardTitle}>Reklam Hesabı</h2></div>
          <div style={styles.accountGrid}>
            {accounts.map(acc => (
              <motion.button key={acc.id} whileHover={{ scale: 1.01 }} onClick={() => handleAccountSelect(acc)}
                style={{ ...styles.accountBtn, ...(selectedAccount === acc.id ? styles.accountActive : {}) }}>
                <div>
                  <div style={styles.accountName}>{acc.name}</div>
                  <div style={styles.accountMeta}>ID: {acc.account_id} • {acc.currency}</div>
                </div>
                {selectedAccount === acc.id && <CheckCircle size={15} color="var(--accent)" />}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Kampaniya seçimi */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={styles.card}>
        <div style={styles.cardHeader}><Facebook size={15} color="var(--accent)" /><h2 style={styles.cardTitle}>Kampaniya Seçin</h2></div>
        {loadingCampaigns ? (
          <div style={styles.loadingRow}><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Yüklənir...</div>
        ) : (
          <div style={styles.campaignGrid}>
            {campaigns.map(c => (
              <motion.button key={c.id} whileHover={{ scale: 1.01 }}
                onClick={() => { setSelectedCampaign(c.id); selectedCampaignRef.current = c.id; setError('') }}
                style={{ ...styles.campaignBtn, ...(selectedCampaign === c.id ? styles.campaignActive : {}) }}>
                <div style={styles.campaignLeft}>
                  <div style={{ ...styles.statusDot, background: c.status === 'ACTIVE' ? '#00d4aa' : '#5a5a7a' }} />
                  <div>
                    <div style={styles.campaignName}>{c.name}</div>
                    <div style={styles.campaignMeta}>{c.status}{c.objective ? ` • ${c.objective}` : ''}</div>
                  </div>
                </div>
                {selectedCampaign === c.id && <CheckCircle size={15} color="var(--accent)" />}
              </motion.button>
            ))}
            {campaigns.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Kampaniya tapılmadı</p>}
          </div>
        )}
      </motion.div>

      {/* Kampaniya Məlumatları */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={styles.card}>
        <div style={styles.cardHeader}>
          <Info size={15} color="#a78bfa" />
          <h2 style={styles.cardTitle}>Kampaniya Məlumatları</h2>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>(isteğe bağlı — doldurulsa AI daha dəqiq analiz edər)</span>
        </div>
        <div style={styles.infoGrid}>
          {/* Kampaniya məqsədi */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}><Target size={13} /> Kampaniya Məqsədi</label>
            <select value={campaignInfo.objective} onChange={e => updateInfo('objective', e.target.value)} style={styles.select}>
              <option value="">Seçin...</option>
              {CAMPAIGN_OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Məzənnə */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}><DollarSign size={13} /> Məzənnə</label>
            <select value={campaignInfo.currency} onChange={e => updateInfo('currency', e.target.value)} style={styles.select}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            {cur && <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>Seçilmiş: {cur.symbol} ({cur.code})</div>}
          </div>

          {/* Məhsul təsviri */}
          <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
            <label style={styles.formLabel}><ShoppingBag size={13} /> Məhsul / Xidmət Təsviri</label>
            <textarea value={campaignInfo.product_desc} onChange={e => updateInfo('product_desc', e.target.value)}
              placeholder="Məs: Saç tökülmə problemi olanlar üçün təbii saç çıxardıcı serum. 3 ayda nəticə görülür."
              style={{ ...styles.textarea }} rows={2} />
          </div>

          {/* Məhsul linki */}
          <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
            <label style={styles.formLabel}><Link size={13} /> Məhsul / Landing Page Linki</label>
            <input type="url" value={campaignInfo.product_link} onChange={e => updateInfo('product_link', e.target.value)}
              placeholder="https://..." style={styles.input} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>AI bu linki analiz edib saytı haqqında məlumat çəkəcək</div>
          </div>

          {/* Hədəf auditoriya */}
          <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
            <label style={styles.formLabel}><Target size={13} /> Hədəf Auditoriya</label>
            <textarea value={campaignInfo.target_audience} onChange={e => updateInfo('target_audience', e.target.value)}
              placeholder="Məs: Avropada yaşayan 25-45 yaş azerbaycanlılar, sağlıq problemlərinə həll axtaranlar"
              style={styles.textarea} rows={2} />
          </div>

          {/* Əlavə qeydlər */}
          <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
            <label style={styles.formLabel}><Info size={13} /> Əlavə Qeydlər</label>
            <textarea value={campaignInfo.notes} onChange={e => updateInfo('notes', e.target.value)}
              placeholder="Məs: Bu ay endirimlər var, rəqib A şirkəti oxşar məhsul satır, büdcə aylıq 2000€"
              style={styles.textarea} rows={2} />
          </div>
        </div>
      </motion.div>

      <div style={styles.grid}>
        {/* Tarix */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={styles.card}>
          <div style={styles.cardHeader}><Calendar size={15} color="var(--accent)" /><h2 style={styles.cardTitle}>Tarix Aralığı</h2></div>
          <div style={styles.presetGrid}>
            {DATE_PRESETS.map(d => (
              <motion.button key={d.id} whileTap={{ scale: 0.97 }}
                onClick={() => { setDatePreset(d.id); datePresetRef.current = d.id }}
                style={{ ...styles.presetBtn, ...(datePreset === d.id ? styles.presetActive : {}) }}>
                {d.label}
                {datePreset === d.id && <CheckCircle size={11} color="var(--accent)" />}
              </motion.button>
            ))}
          </div>
          <div style={styles.selectedInfo}>Seçilmiş: <b style={{ color: 'var(--accent)' }}>{DATE_PRESETS.find(d => d.id === datePreset)?.label}</b></div>
        </motion.div>

        {/* AI + Bazar */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} style={styles.card}>
          <div style={styles.cardHeader}><Bot size={15} color="var(--accent)" /><h2 style={styles.cardTitle}>AI & Bazar</h2></div>
          <div style={styles.providerRow}>
            {AI_PROVIDERS.map(p => (
              <motion.button key={p.id} whileTap={{ scale: 0.97 }} onClick={() => setProvider(p.id)}
                style={{ ...styles.providerBtn, border: `2px solid ${provider === p.id ? p.color : 'var(--border)'}`, background: provider === p.id ? `${p.color}18` : 'var(--bg-secondary)' }}>
                <div style={{ ...styles.dot, background: p.color }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</span>
                {provider === p.id && <CheckCircle size={11} color={p.color} />}
              </motion.button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {MARKETS.map(m => (
              <motion.button key={m.id} whileTap={{ scale: 0.97 }} onClick={() => setMarket(m.id)}
                style={{ ...styles.marketBtn, ...(market === m.id ? styles.marketActive : {}) }}>
                {m.label}
              </motion.button>
            ))}
          </div>
          <div style={styles.infoBox}>
            <div style={styles.infoRow}><span style={styles.infoCheck}>✓</span> Campaign analizi</div>
            <div style={styles.infoRow}><span style={styles.infoCheck}>✓</span> Ad Set analizi</div>
            <div style={styles.infoRow}><span style={styles.infoCheck}>✓</span> Kreativ analizi</div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.errorBox}>
            <AlertCircle size={16} />{error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
        onClick={handleAnalyze} disabled={loading}
        style={{ ...styles.submitBtn, opacity: loading ? 0.85 : 1 }}>
        {loading
          ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />{loadingStep}</>
          : <><Facebook size={20} />Kampaniyanı Analiz Et</>}
      </motion.button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  fbIcon: { width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #1877f2, #0a5abf)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(24,119,242,0.4)', flexShrink: 0 },
  pageTitle: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  subtitle: { color: 'var(--text-secondary)', fontSize: 13 },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: 600, margin: 0 },
  loadingRow: { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 },
  accountGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 },
  accountBtn: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  accountActive: { border: '1px solid var(--accent)', background: 'rgba(108,99,255,0.1)' },
  accountName: { fontWeight: 600, fontSize: 13, marginBottom: 2 },
  accountMeta: { fontSize: 11, color: 'var(--text-muted)' },
  campaignGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  campaignBtn: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' },
  campaignActive: { border: '1px solid var(--accent)', background: 'rgba(108,99,255,0.1)' },
  campaignLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  statusDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  campaignName: { fontWeight: 600, fontSize: 14, marginBottom: 2 },
  campaignMeta: { fontSize: 11, color: 'var(--text-muted)' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  formLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  select: { padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' },
  input: { padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' },
  textarea: { padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  presetGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 10 },
  presetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  presetActive: { border: '1px solid var(--accent)', background: 'rgba(108,99,255,0.12)', color: 'var(--accent)' },
  selectedInfo: { fontSize: 12, color: 'var(--text-muted)' },
  providerRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  providerBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  marketBtn: { flex: 1, padding: 9, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  marketActive: { border: '1px solid var(--accent)', background: 'rgba(108,99,255,0.12)', color: 'var(--accent)' },
  infoBox: { marginTop: 12, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 9, border: '1px solid var(--border)' },
  infoRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', padding: '2px 0' },
  infoCheck: { color: '#00d4aa', fontWeight: 700 },
  errorBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(255,92,122,0.1)', border: '1px solid rgba(255,92,122,0.3)', borderRadius: 10, color: 'var(--danger)', fontSize: 14, marginBottom: 16 },
  submitBtn: { width: '100%', padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, #1877f2, #0a5abf)', color: '#fff', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(24,119,242,0.35)' },
}
