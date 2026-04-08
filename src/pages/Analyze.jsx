import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSpreadsheet, Bot, Globe, Key, X, Loader2, CheckCircle, AlertCircle, Lock, Edit3 } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { analysisAPI } from '../api.js'

const AI_PROVIDERS = [
  { id: 'openai',   name: 'OpenAI GPT-4',  color: '#10a37f', desc: 'gpt-4o-mini',        envKey: 'openai' },
  { id: 'claude',   name: 'Claude',         color: '#d4a27f', desc: 'claude-opus-4-5',    envKey: 'claude' },
  { id: 'gemini',   name: 'Gemini',         color: '#4285f4', desc: 'gemini-2.0-flash',   envKey: 'gemini' },
  { id: 'deepseek', name: 'DeepSeek',       color: '#6c63ff', desc: 'deepseek-chat',      envKey: 'deepseek' },
  { id: 'kimi',     name: 'Kimi K2',        color: '#ff6b6b', desc: 'moonshot-v1-8k',     envKey: null },
]

const MARKETS = [
  { id: 'tr',    label: '🇹🇷 Türkiyə', desc: 'TL bazarı benchmark-ları' },
  { id: 'eu_us', label: '🌍 AB/ABŞ',   desc: 'USD bazarı benchmark-ları' },
]

const API_LINKS = {
  openai:   'https://platform.openai.com/api-keys',
  claude:   'https://console.anthropic.com/',
  gemini:   'https://aistudio.google.com/app/apikey',
  deepseek: 'https://platform.deepseek.com/',
  kimi:     'https://platform.moonshot.cn/',
}

export default function Analyze() {
  const [file, setFile]         = useState(null)
  const [provider, setProvider] = useState('deepseek')
  const [market, setMarket]     = useState('tr')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [dragOver, setDragOver] = useState(false)

  // API key state: 'auto' = .env-dən, 'manual' = istifadəçi yazır
  const [keyMode, setKeyMode]   = useState('auto')
  const [manualKey, setManualKey] = useState('')

  const fileRef = useRef()
  const navigate = useNavigate()

  const selectedProvider = AI_PROVIDERS.find(p => p.id === provider)
  // Kimi üçün həmişə manual
  const forceManual = selectedProvider?.envKey === null

  useEffect(() => {
    if (forceManual) setKeyMode('manual')
    else setKeyMode('auto')
    setManualKey('')
  }, [provider])

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
      setFile(f); setError('')
    } else {
      setError('Yalnız CSV və Excel faylları qəbul edilir')
    }
  }

  const handleSubmit = async () => {
    if (!file) { setError('Fayl seçin'); return }
    if (keyMode === 'manual' && !manualKey.trim()) { setError('API açarı daxil edin'); return }
    setError(''); setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ai_provider', provider)
      formData.append('api_key', keyMode === 'auto' ? 'USE_ENV' : manualKey.trim())
      formData.append('market', market)
      const res = await analysisAPI.analyze(formData)
      navigate(`/results/${res.data.analysis_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analiz zamanı xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={styles.header}>
        <h1 style={styles.pageTitle}>Yeni Analiz</h1>
        <p style={styles.subtitle}>Meta Ads məlumatlarınızı yükləyin və AI analizi başladın</p>
      </motion.div>

      <div style={styles.grid}>
        {/* Step 1: File */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={styles.card}>
          <div style={styles.stepHeader}>
            <div style={styles.stepNum}>1</div>
            <h2 style={styles.stepTitle}>Faylı Yükləyin</h2>
          </div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            style={{ ...styles.dropzone, ...(dragOver ? styles.dropzoneActive : {}) }}
          >
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
              onChange={e => { setFile(e.target.files[0]); setError('') }} />
            {file ? (
              <div style={styles.fileSelected}>
                <FileSpreadsheet size={32} color="var(--success)" />
                <div style={{ flex: 1 }}>
                  <div style={styles.fileName}>{file.name}</div>
                  <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null) }} style={styles.clearBtn}><X size={16} /></button>
              </div>
            ) : (
              <>
                <Upload size={36} color="var(--text-muted)" />
                <div style={styles.dropText}>CSV və ya Excel faylını buraya sürükləyin</div>
                <div style={styles.dropHint}>və ya klikləyin seçin</div>
                <div style={styles.formatBadges}>
                  {['CSV', 'XLSX', 'XLS'].map(f => <span key={f} style={styles.formatBadge}>{f}</span>)}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Step 2: AI Provider */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} style={styles.card}>
          <div style={styles.stepHeader}>
            <div style={styles.stepNum}>2</div>
            <h2 style={styles.stepTitle}>AI Provayderi Seçin</h2>
          </div>
          <div style={styles.providerGrid}>
            {AI_PROVIDERS.map(p => (
              <motion.button key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setProvider(p.id)}
                style={{ ...styles.providerBtn, border: `2px solid ${provider === p.id ? p.color : 'var(--border)'}`, background: provider === p.id ? `${p.color}18` : 'var(--bg-secondary)' }}
              >
                <div style={{ ...styles.providerDot, background: p.color }} />
                <div style={styles.providerInfo}>
                  <div style={styles.providerName}>{p.name}</div>
                  <div style={styles.providerDesc}>{p.desc}</div>
                </div>
                {provider === p.id && <CheckCircle size={16} color={p.color} />}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Step 3: Market */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={styles.card}>
          <div style={styles.stepHeader}>
            <div style={styles.stepNum}>3</div>
            <h2 style={styles.stepTitle}>Bazar Seçin</h2>
          </div>
          <div style={styles.marketRow}>
            {MARKETS.map(m => (
              <motion.button key={m.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setMarket(m.id)}
                style={{ ...styles.marketBtn, border: `2px solid ${market === m.id ? 'var(--accent)' : 'var(--border)'}`, background: market === m.id ? 'rgba(108,99,255,0.15)' : 'var(--bg-secondary)' }}
              >
                <div>
                  <div style={styles.marketLabel}>{m.label}</div>
                  <div style={styles.marketDesc}>{m.desc}</div>
                </div>
                {market === m.id && <CheckCircle size={16} color="var(--accent)" />}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Step 4: API Key */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} style={styles.card}>
          <div style={styles.stepHeader}>
            <div style={styles.stepNum}>4</div>
            <h2 style={styles.stepTitle}>API Açarı — {selectedProvider?.name}</h2>
          </div>

          {/* Mode Toggle - Kimi üçün göstərmə */}
          {!forceManual && (
            <div style={styles.modeToggle}>
              <button
                onClick={() => setKeyMode('auto')}
                style={{ ...styles.modeBtn, ...(keyMode === 'auto' ? styles.modeBtnActive : {}) }}
              >
                <Lock size={13} />
                Avtomatik (.env)
              </button>
              <button
                onClick={() => setKeyMode('manual')}
                style={{ ...styles.modeBtn, ...(keyMode === 'manual' ? styles.modeBtnActive : {}) }}
              >
                <Edit3 size={13} />
                Özüm yazım
              </button>
            </div>
          )}

          {/* Auto mode info */}
          {keyMode === 'auto' && !forceManual && (
            <div style={styles.autoInfo}>
              <CheckCircle size={16} color="var(--success)" />
              <span>API açarı <b>.env</b> faylından avtomatik oxunacaq. Heç nə yazmağa ehtiyac yoxdur.</span>
            </div>
          )}

          {/* Manual mode input */}
          {(keyMode === 'manual' || forceManual) && (
            <>
              <div style={styles.apiKeyWrap}>
                <Key size={16} color="var(--text-muted)" style={styles.apiIcon} />
                <input
                  type="password"
                  value={manualKey}
                  onChange={e => setManualKey(e.target.value)}
                  placeholder={`${selectedProvider?.name} API açarınızı daxil edin...`}
                  style={styles.apiInput}
                />
              </div>
              <a href={API_LINKS[provider]} target="_blank" rel="noreferrer" style={styles.apiLink}>
                🔗 {selectedProvider?.name} API açarı al
              </a>
            </>
          )}

          <p style={styles.apiNote}>🔒 API açarları serverdə saxlanılmır.</p>
        </motion.div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorBox}>
            <AlertCircle size={16} />{error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
        onClick={handleSubmit} disabled={loading}
        style={{ ...styles.submitBtn, opacity: loading ? 0.85 : 1 }}
      >
        {loading ? (
          <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />{selectedProvider?.name} analiz edir... (30-90 saniyə)</>
        ) : (
          <><Bot size={20} />{selectedProvider?.name} ilə Analizi Başlat</>
        )}
      </motion.button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  )
}

const styles = {
  header: { marginBottom: '32px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', marginBottom: '6px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' },
  stepHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  stepNum: { width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0, color: '#fff' },
  stepTitle: { fontSize: '16px', fontWeight: '600' },
  dropzone: { border: '2px dashed var(--border)', borderRadius: '12px', padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'all 0.2s', background: 'var(--bg-secondary)', textAlign: 'center' },
  dropzoneActive: { borderColor: 'var(--accent)', background: 'rgba(108,99,255,0.1)' },
  fileSelected: { display: 'flex', alignItems: 'center', gap: '16px', width: '100%' },
  fileName: { fontWeight: '600', fontSize: '14px', wordBreak: 'break-all' },
  fileSize: { color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' },
  clearBtn: { background: 'none', color: 'var(--text-muted)', padding: '4px', display: 'flex', border: 'none', cursor: 'pointer' },
  dropText: { fontWeight: '500', color: 'var(--text-secondary)' },
  dropHint: { color: 'var(--text-muted)', fontSize: '13px' },
  formatBadges: { display: 'flex', gap: '8px' },
  formatBadge: { padding: '3px 10px', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' },
  providerGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  providerBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: 'none', textAlign: 'left', transition: 'all 0.2s', width: '100%', cursor: 'pointer' },
  providerDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  providerInfo: { flex: 1 },
  providerName: { fontWeight: '600', fontSize: '14px', marginBottom: '1px', color: 'var(--text-primary)' },
  providerDesc: { fontSize: '11px', color: 'var(--text-muted)' },
  marketRow: { display: 'flex', flexDirection: 'column', gap: '10px' },
  marketBtn: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '16px', borderRadius: '10px', background: 'none', textAlign: 'left', transition: 'all 0.2s', width: '100%', cursor: 'pointer' },
  marketLabel: { fontWeight: '600', fontSize: '15px', marginBottom: '3px', color: 'var(--text-primary)' },
  marketDesc: { fontSize: '12px', color: 'var(--text-muted)' },
  modeToggle: { display: 'flex', gap: '8px', marginBottom: '14px' },
  modeBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '9px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
  modeBtnActive: { background: 'rgba(108,99,255,0.15)', borderColor: 'var(--accent)', color: 'var(--accent)' },
  autoInfo: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.5' },
  apiKeyWrap: { position: 'relative', marginBottom: '10px' },
  apiIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
  apiInput: { width: '100%', padding: '12px 14px 12px 42px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' },
  apiLink: { display: 'inline-block', fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', marginBottom: '10px' },
  apiNote: { fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255,92,122,0.1)', border: '1px solid rgba(255,92,122,0.3)', borderRadius: '10px', color: 'var(--danger)', fontSize: '14px', marginBottom: '20px' },
  submitBtn: { width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--gradient)', color: '#fff', fontWeight: '700', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 30px var(--accent-glow)', border: 'none', cursor: 'pointer' },
}
