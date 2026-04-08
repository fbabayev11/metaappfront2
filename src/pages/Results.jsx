import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, RadialBarChart, RadialBar, Legend
} from 'recharts'
import {
  ArrowLeft, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Target, Lightbulb, Loader2, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { analysisAPI } from '../api.js'

const statusColor = {
  'Mükemmel': '#00d4aa', 'Əla': '#00d4aa',
  'Yaxşı': '#4ecdc4', 'Orta': '#ffb347',
  'Zəif': '#ff5c7a', 'Kritik': '#ff0044',
  good: '#00d4aa', warning: '#ffb347', bad: '#ff5c7a',
}

const priorityConfig = {
  high:   { color: '#ff5c7a', bg: 'rgba(255,92,122,0.08)',  label: 'Yüksək' },
  medium: { color: '#ffb347', bg: 'rgba(255,179,71,0.08)',  label: 'Orta' },
  low:    { color: '#00d4aa', bg: 'rgba(0,212,170,0.08)',   label: 'Aşağı' },
}

// Animated counter
function AnimatedNum({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const num = parseFloat(value) || 0
    let start = 0
    const steps = 40
    const inc = num / steps
    let i = 0
    const t = setInterval(() => {
      i++
      start += inc
      setDisplay(i >= steps ? num : start)
      if (i >= steps) clearInterval(t)
    }, 18)
    return () => clearInterval(t)
  }, [value])
  return <>{prefix}{typeof display === 'number' ? display.toFixed(decimals) : display}{suffix}</>
}

// Metric card with trend indicator
function MetricCard({ label, value, suffix = '', prefix = '', status, icon, delay = 0 }) {
  const color = statusColor[status] || 'var(--accent)'
  const isGood = status === 'good' || status === 'Əla' || status === 'Mükemmel' || status === 'Yaxşı'
  const isBad = status === 'bad' || status === 'Zəif' || status === 'Kritik'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: `0 12px 40px ${color}22` }}
      style={{ ...styles.metCard, borderTop: `3px solid ${color}` }}
    >
      <div style={styles.metTop}>
        <span style={styles.metLabel}>{label}</span>
        {isGood && <ArrowUpRight size={14} color="#00d4aa" />}
        {isBad  && <ArrowDownRight size={14} color="#ff5c7a" />}
      </div>
      <div style={{ ...styles.metValue, color }}>
        <AnimatedNum value={value} prefix={prefix} suffix={suffix} decimals={value % 1 !== 0 ? 2 : 0} />
      </div>
      <div style={{ ...styles.metBar, background: `${color}22` }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((parseFloat(value) / (parseFloat(value) * 1.5 || 1)) * 100, 100)}%` }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: '4px', background: color }}
        />
      </div>
    </motion.div>
  )
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipLabel}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: '13px', fontWeight: '600' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  )
}

const METRIC_COLORS = ['#6c63ff','#00d4aa','#ffb347','#4ecdc4','#ff6b9d','#a78bfa','#fb923c','#34d399','#60a5fa','#f472b6','#818cf8','#e879f9','#22d3ee','#94a3b8','#fbbf24','#2dd4bf','#f87171','#c084fc','#fb7185','#38bdf8','#4ade80','#facc15']

const BASE_METRICS = [
  { id: 'Skor',              label: 'Performans Skoru' },
  { id: 'roas',              label: 'ROAS' },
  { id: 'cpm',               label: 'CPM' },
  { id: 'cpc',               label: 'CPC' },
  { id: 'ctr',               label: 'CTR' },
  { id: 'purchases',         label: 'Alışlar' },
  { id: 'spend',             label: 'Xərc' },
  { id: 'hook_rate',         label: 'Hook Rate' },
  { id: 'thumbstop',         label: 'Thumbstop Rate' },
  { id: 'hold_rate',         label: 'Hold Rate' },
  { id: 'completion',        label: 'Completion Rate' },
  { id: 'frequency',         label: 'Sıxlıq (Frequency)' },
  { id: 'reach',             label: 'Çatış (Reach)' },
  { id: 'impressions',       label: 'Göstəriş (Impressions)' },
  { id: 'clicks',            label: 'Kliklər' },
  { id: 'video_plays',       label: 'Video Oynatma' },
  { id: 'outbound_ctr',      label: 'Outbound CTR' },
  { id: 'atc',               label: 'Səbətə Əlavə (ATC)' },
  { id: 'cost_per_purchase', label: 'CPA (Alış başına xərc)' },
  { id: 'cpa_atc',           label: 'ATC başına xərc' },
  { id: 'cpa_checkout',      label: 'Checkout başına xərc' },
  { id: 'lpv',               label: 'Açılış Səhifəsi Görüntülənməsi (LPV)' },
  { id: 'checkout',          label: 'Ödəniş Başlatma (Checkout)' },
  { id: 'link_clicks',       label: 'Link Kliklər' },
  { id: 'page_engagement',   label: 'Səhifə Etkileşimi' },
  { id: 'video_avg_time',    label: 'Ortalama İzləmə Müddəti' },
  { id: 'unique_ctr',        label: 'Unikal CTR' },
  { id: 'thruplays',         label: 'ThruPlay' },
  { id: 'unique_clicks',     label: 'Unikal Kliklər' },
]

const CHART_METRICS = BASE_METRICS.map((m, i) => ({ ...m, color: METRIC_COLORS[i % METRIC_COLORS.length] }))

function InteractiveChart({ items, dataLevel }) {
  const [activeMetrics, setActiveMetrics] = useState(['Skor', 'roas'])
  const [metricSearch, setMetricSearch] = useState('')

  const toggleMetric = (id) => {
    setActiveMetrics(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(m => m !== id) : prev
        : [...prev, id]
    )
  }



  const chartData = items.slice(0, 10).map(item => {
    const km = item.key_metrics || {}
    const parse = (v) => { const n = parseFloat(String(v || 0).replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n }
    const r2 = item.metrics_raw || {}
    const g = (keys) => {
      for (const k of keys) {
        const val = km[k] !== undefined ? km[k] : r2[k]
        if (val !== undefined && val !== null && val !== '' && !String(val).includes('<')) {
          const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''))
          if (!isNaN(n) && n !== 0) return n
        }
      }
      return 0
    }
    return {
      name: (item.name || 'N/A').slice(0, 14),
      Skor: Number(item.score || 0),
      roas: g(['roas','Purchase ROAS (return on ad spend)']),
      cpm: g(['cpm','CPM (cost per 1,000 impressions) (EUR)']),
      cpc: g(['cpc','CPC (all) (EUR)']),
      ctr: g(['ctr','CTR (all)']),
      purchases: g(['purchases','Purchases']),
      spend: g(['spend','Amount spent (EUR)']),
      hook_rate: g(['hook_rate','Hook Rate']),
      thumbstop: g(['thumbstop','Thumbstop Rate']),
      hold_rate: g(['hold_rate','Hold Rate']),
      completion: g(['completion','Completion Rate']),
      frequency: g(['frequency','Frequency']),
      reach: g(['reach','Reach']),
      impressions: g(['impressions','Impressions']),
      clicks: g(['clicks','Clicks']),
      video_plays: g(['video_plays','Video plays']),
      outbound_ctr: g(['outbound_ctr','Outbound CTR']),
      atc: g(['atc','Adds to cart']),
      cost_per_purchase: g(['cost_per_purchase','Cost per purchase (EUR)']),
      cpa_atc: g(['cpa_atc','Cost per ATC (EUR)']),
      cpa_checkout: g(['cpa_checkout','Cost per Checkout (EUR)']),
      lpv: g(['lpv','Landing page views']),
      checkout: g(['checkout','Checkouts initiated']),
      link_clicks: g(['link_clicks','Outbound clicks']),
      page_engagement: g(['page_engagement','Post engagement']),
      video_avg_time: g(['video_avg_time','Video avg play time']),
      unique_ctr: g(['unique_ctr','Unique CTR (all)']),
      thruplays: g(['thruplays','ThruPlays']),
      unique_clicks: g(['unique_clicks','Unique clicks (all)']),
      status: item.status,
    }
  })

  const CustomTooltipChart = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px' }}>
        <div style={{ color: '#5a5a7a', fontSize: '11px', marginBottom: '6px', fontWeight: 600 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontSize: '13px', fontWeight: 600 }}>
            {p.name}: {p.value?.toFixed(2)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          <h2 style={{ fontSize: '17px', fontWeight: '700', margin: '0 4px 0 0' }}>Kreativ Müqayisəsi</h2>
          {CHART_METRICS.filter(m => activeMetrics.includes(m.id)).map(m => (
            <button key={m.id} onClick={() => toggleMetric(m.id)}
              style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.15s',
                border: `1.5px solid ${m.color}`,
                background: `${m.color}20`,
                color: m.color,
              }}>
              {m.label} ×
            </button>
          ))}
          <div style={{ position: 'relative', marginLeft: '4px' }}>
            <input
              value={metricSearch}
              onChange={e => setMetricSearch(e.target.value)}
              placeholder="+ Metrik əlavə et..."
              style={{ padding: '5px 14px', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none', width: '150px' }}
            />
            {metricSearch && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '6px', zIndex: 100, minWidth: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                {CHART_METRICS.filter(m => !activeMetrics.includes(m.id) && m.label.toLowerCase().includes(metricSearch.toLowerCase())).map(m => (
                  <button key={m.id} onClick={() => { toggleMetric(m.id); setMetricSearch('') }}
                    style={{ display: 'block', width: '100%', padding: '7px 10px', borderRadius: '7px', border: 'none', background: 'transparent', color: m.color, fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.target.style.background = `${m.color}15`}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    {m.label}
                  </button>
                ))}
                {CHART_METRICS.filter(m => !activeMetrics.includes(m.id) && m.label.toLowerCase().includes(metricSearch.toLowerCase())).length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '6px 10px' }}>Tapılmadı</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px' }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 60 }} barSize={16} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#5a5a7a', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#5a5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipChart />} cursor={{ fill: 'rgba(108,99,255,0.05)' }} />
            {CHART_METRICS.filter(m => activeMetrics.includes(m.id)).map(m => (
              <Bar key={m.id} dataKey={m.id} name={m.label} fill={m.color} radius={[6, 6, 0, 0]} fillOpacity={0.85} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    analysisAPI.getById(id)
      .then(res => setAnalysis(res.data))
      .catch(() => setError('Analiz tapılmadı'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <Layout>
      <div style={styles.center}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 size={40} color="var(--accent)" />
        </motion.div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Yüklənir...</p>
      </div>
    </Layout>
  )

  if (error || !analysis) return (
    <Layout>
      <div style={styles.center}>
        <AlertTriangle size={40} color="var(--danger)" />
        <p style={{ color: 'var(--danger)', marginTop: '16px' }}>{error}</p>
        <button onClick={() => navigate('/')} style={styles.backBtnSolid}>Panelə qayıt</button>
      </div>
    </Layout>
  )

  const r = analysis.result || {}
  const items = r.items_analysis || []
  const recs = r.recommendations || []
  const budget = r.budget_analysis || {}
  const isCreative = r.data_level === 'creative'
  const score = r.overall_score || 0
  const scoreColor = score >= 70 ? '#00d4aa' : score >= 40 ? '#ffb347' : '#ff5c7a'

  // === ƏSAS METRİKLƏR — items_analysis-dən ortalama hesabla ===
  const calcAvg = (key) => {
    const vals = items.map(it => {
      const km = it.key_metrics || {}
      const v = km[key]
      if (v === undefined || v === null || v === '<if available>' || v === '<if video>') return null
      const n = parseFloat(String(v).replace(/[^0-9.]/g, ''))
      return isNaN(n) ? null : n
    }).filter(v => v !== null)
    if (!vals.length) return 0
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }
  const calcSum = (key) => {
    const vals = items.map(it => {
      const km = it.key_metrics || {}
      const v = km[key]
      if (!v || v === '<if available>' || v === '<if video>') return null
      const n = parseFloat(String(v).replace(/[^0-9.]/g, ''))
      return isNaN(n) ? null : n
    }).filter(v => v !== null)
    return vals.reduce((a, b) => a + b, 0)
  }

  // derived_metrics-dən oxu (backend hesablayıb), yoxdursa items-dən
  const derived = r.derived_metrics || {}
  const spend     = derived.spend     || calcSum('spend')     || 0
  const cpm       = derived.cpm       || calcAvg('cpm')       || 0
  const cpc       = derived.cpc       || calcAvg('cpc')       || 0
  const ctr       = derived.ctr_link  || calcAvg('ctr')       || 0
  const roas      = derived.roas      || calcAvg('roas')      || 0
  const purchases = derived.purchases || calcSum('purchases')  || 0

  // Chart data
  const chartData = items.slice(0, 8).map(c => ({
    name: (c.name || 'N/A').slice(0, 16),
    Skor: Number(c.score || 0),
    status: c.status,
  }))

  // Kreativ müqayisə data
  const creativeChartData = isCreative ? items.slice(0, 6).map(c => {
    const km = c.key_metrics || {}
    return {
      name: (c.name || '').slice(0, 14),
      ROAS: parseFloat(km.roas) || 0,
      Hook: parseFloat(km.hook_rate) || 0,
      status: c.status,
    }
  }) : []

  // En iyi / en kötü kreativ
  const sorted = isCreative ? [...items].sort((a, b) => (b.score || 0) - (a.score || 0)) : []
  const bestCreative  = sorted[0]
  const worstCreative = sorted[sorted.length - 1]

  // Top 4 summary metrics
  const totalRevenue = (() => {
    // 1. metrics_raw-dan Purchase conversion value cəmi
    const fromRaw = items.reduce((sum, it) => {
      const r2 = it.metrics_raw || {}
      const v = parseFloat(String(r2['Purchase conversion value (EUR)'] ?? r2['Purchase conversion value'] ?? 0).replace(/[^0-9.-]/g,''))
      return sum + (isNaN(v) ? 0 : v)
    }, 0)
    if (fromRaw > 0) return fromRaw
    // 2. derived_metrics-dən
    if (r.derived_metrics?.revenue) return r.derived_metrics.revenue
    // 3. Spend × ROAS
    return spend * roas
  })()

  return (
    <Layout>
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          <ArrowLeft size={16} /> Geri
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={styles.pageTitle}>{
            analysis.filename
              .replace(/^Facebook_/i, '')
              .replace(/_(ad|adset|campaign)_/i, ' ')
              .replace(/[.]csv$/i, '')
              .replace(/_/g, ' ')
              .trim()
          }</h1>
          <div style={styles.chips}>
            <span style={styles.chip}>{analysis.ai_provider?.toUpperCase()}</span>
            <span style={styles.chip}>{analysis.market === 'tr' ? '🇹🇷 Türkiyə' : '🌍 AB/ABŞ'}</span>
            {r.data_level && <span style={styles.chip}>{r.data_level?.toUpperCase()}</span>}
          </div>
        </div>
        {/* Score ring */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ ...styles.scoreRing, borderColor: scoreColor, color: scoreColor }}
        >
          <div style={styles.scoreNum}>{score}</div>
          <div style={styles.scoreSub}>/ 100</div>
        </motion.div>
      </motion.div>

      {/* ── SUMMARY BAR ── */}
      {r.summary && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={styles.summaryBar}>
          <div style={{ ...styles.statusDot, background: statusColor[r.overall_status] || 'var(--accent)' }} />
          <div>
            <span style={{ ...styles.statusLabel, color: statusColor[r.overall_status] || 'var(--accent)' }}>
              {r.overall_status}
            </span>
            <p style={styles.summaryText}>{r.summary}</p>
          </div>
        </motion.div>
      )}

      {/* ── TOP SUMMARY CARDS ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Ortalama Skor', value: String(score), suffix: '' },
          { label: 'Ortalama ROAS', value: roas.toFixed(2), suffix: 'x' },
          { label: 'Toplam Harcama', value: spend.toFixed(2), prefix: '€' },
          { label: 'Toplam Gelir', value: totalRevenue.toFixed(2), prefix: '€' },
        ].map((c, i) => (
          <motion.div key={i} whileHover={{ y: -2 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{c.label}</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {c.prefix || ''}{c.value}{c.suffix || ''}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════
          1. ƏSAS METRİKLƏR
      ══════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionDot} />
          <h2 style={styles.sectionTitle}>Əsas Göstəricilər</h2>
        </div>
        <div style={styles.metricsGrid}>
          <MetricCard label="Ümumi Xərc"   value={spend}     prefix="€"  status={spend > 0 ? 'good' : 'warning'} delay={0.15} />
          <MetricCard label="CPM"           value={cpm}       prefix="€"  status={cpm < 15 ? 'good' : cpm < 30 ? 'warning' : 'bad'} delay={0.2} />
          <MetricCard label="CPC"           value={cpc}       prefix="€"  status={cpc < 1 ? 'good' : cpc < 2.5 ? 'warning' : 'bad'} delay={0.25} />
          <MetricCard label="CTR"           value={ctr}       suffix="%"  status={ctr > 2 ? 'good' : ctr > 1 ? 'warning' : 'bad'} delay={0.3} />
          <MetricCard label="ROAS"          value={roas}      suffix="x"  status={roas >= 3 ? 'good' : roas >= 2 ? 'warning' : 'bad'} delay={0.35} />
          <MetricCard label="Alışlar"       value={purchases} suffix=" ədəd" status={purchases > 0 ? 'good' : 'warning'} delay={0.4} />
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          2. İNTERAKTİV QRAFİK
      ══════════════════════════════════════ */}
      {items.length > 0 && <InteractiveChart items={items} dataLevel={r.data_level} />}

      {/* ══════════════════════════════════════
          3. KREATİV ANALİZİ (yalnız creative level)
      ══════════════════════════════════════ */}
      {isCreative && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.sectionDot, background: '#ffb347' }} />
            <h2 style={styles.sectionTitle}>Kreativ Analizi</h2>
          </div>

          {/* Best / Worst */}
          <div style={styles.creativeHighlights}>
            {bestCreative && (
              <motion.div whileHover={{ scale: 1.02 }} style={{ ...styles.highlightCard, borderColor: '#00d4aa' }}>
                <div style={{ ...styles.highlightBadge, background: 'rgba(0,212,170,0.12)', color: '#00d4aa' }}>
                  🏆 Ən İyi Performans
                </div>
                <div style={styles.highlightName}>{bestCreative.name}</div>
                <div style={styles.highlightMeta}>
                  {bestCreative.key_metrics?.roas && <span style={styles.kmChip}>ROAS: {bestCreative.key_metrics.roas}</span>}
                  {bestCreative.key_metrics?.hook_rate && <span style={styles.kmChip}>Hook: {bestCreative.key_metrics.hook_rate}</span>}
                  <span style={{ ...styles.kmChip, background: 'rgba(0,212,170,0.1)', color: '#00d4aa' }}>Skor: {bestCreative.score}</span>
                </div>
                <p style={styles.highlightVerdict}>{bestCreative.verdict}</p>
                <div style={styles.highlightAction}><Zap size={12} />{bestCreative.action}</div>
              </motion.div>
            )}
            {worstCreative && worstCreative !== bestCreative && (
              <motion.div whileHover={{ scale: 1.02 }} style={{ ...styles.highlightCard, borderColor: '#ff5c7a' }}>
                <div style={{ ...styles.highlightBadge, background: 'rgba(255,92,122,0.12)', color: '#ff5c7a' }}>
                  ⚠️ Ən Zəif Performans
                </div>
                <div style={styles.highlightName}>{worstCreative.name}</div>
                <div style={styles.highlightMeta}>
                  {worstCreative.key_metrics?.roas && <span style={styles.kmChip}>ROAS: {worstCreative.key_metrics.roas}</span>}
                  {worstCreative.key_metrics?.hook_rate && <span style={styles.kmChip}>Hook: {worstCreative.key_metrics.hook_rate}</span>}
                  <span style={{ ...styles.kmChip, background: 'rgba(255,92,122,0.1)', color: '#ff5c7a' }}>Skor: {worstCreative.score}</span>
                </div>
                <p style={styles.highlightVerdict}>{worstCreative.verdict}</p>
                <div style={{ ...styles.highlightAction, background: 'rgba(255,92,122,0.1)', color: '#ff5c7a' }}><AlertTriangle size={12} />{worstCreative.action}</div>
              </motion.div>
            )}
          </div>



          {/* Bütün kreativlər */}
          <div style={styles.allItems}>
            {items.map((item, i) => {
              const sc = statusColor[item.status] || '#5a5a7a'
              const km = item.key_metrics || {}
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  whileHover={{ x: 4, boxShadow: `0 4px 24px ${sc}18` }}
                  style={{ ...styles.itemRow, borderLeft: `3px solid ${sc}` }}
                >
                  <div style={styles.itemRowLeft}>
                    <div style={{ ...styles.itemScore, color: sc, borderColor: `${sc}44` }}>{item.score}</div>
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <span style={{ ...styles.statusTag, background: `${sc}18`, color: sc }}>{item.status}</span>
                    </div>
                  </div>
                  <div style={styles.itemRowRight}>
                    {km.roas && km.roas !== '<if available>' && <span style={styles.kmPill}><b>ROAS</b> {km.roas}</span>}
                    {km.hook_rate && km.hook_rate !== '<if video>' && <span style={styles.kmPill}><b>Hook</b> {km.hook_rate}</span>}
                    {km.thumbstop && km.thumbstop !== '<if video>' && <span style={styles.kmPill}><b>Stop</b> {km.thumbstop}</span>}
                    {km.purchases && km.purchases !== '<if available>' && <span style={styles.kmPill}><b>Satış</b> {km.purchases}</span>}
                    {item.spend && <span style={styles.kmPill}>{item.spend}</span>}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Yeni kreativ təklifi */}
          {r.new_creative_suggestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              style={styles.creativeIdea}>
              <Zap size={18} color="#ffb347" />
              <div>
                <div style={{ fontWeight: '700', color: '#ffb347', marginBottom: '6px' }}>Yeni Kreativ İdeyası</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
                  {r.new_creative_suggestion}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          AD SET KARTI (adset level)
      ══════════════════════════════════════ */}
      {r.data_level === 'adset' && items.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.sectionDot, background: '#a78bfa' }} />
            <h2 style={styles.sectionTitle}>Ad Set Nəticələri</h2>
          </div>
          <div style={styles.adsetGrid}>
            {items.map((item, i) => {
              const sc = statusColor[item.status] || '#5a5a7a'
              const km = item.key_metrics || {}
              const parse = (v) => { const n = parseFloat(String(v||0).replace(/[^0-9.]/g,'')); return isNaN(n) ? 0 : n }
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42 + i * 0.05 }}
                  whileHover={{ y: -3, boxShadow: `0 8px 30px ${sc}22` }}
                  style={{ ...styles.adsetCard, borderTop: `3px solid ${sc}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', flex: 1, marginRight: '8px' }}>{item.name}</div>
                    <span style={{ ...styles.statusTag, background: `${sc}18`, color: sc, flexShrink: 0 }}>{item.status}</span>
                  </div>
                  <div style={styles.adsetMetrics}>
                    {km.purchases && km.purchases !== '<if available>' && (
                      <div style={styles.adsetMetric}>
                        <div style={styles.adsetMetricVal}>{parse(km.purchases)}</div>
                        <div style={styles.adsetMetricLbl}>Alış</div>
                      </div>
                    )}
                    {km.roas && km.roas !== '<if available>' && (
                      <div style={styles.adsetMetric}>
                        <div style={{ ...styles.adsetMetricVal, color: parse(km.roas) >= 3 ? '#00d4aa' : '#ffb347' }}>{parse(km.roas).toFixed(2)}x</div>
                        <div style={styles.adsetMetricLbl}>ROAS</div>
                      </div>
                    )}
                    {km.cpm && (
                      <div style={styles.adsetMetric}>
                        <div style={styles.adsetMetricVal}>€{parse(km.cpm).toFixed(2)}</div>
                        <div style={styles.adsetMetricLbl}>CPM</div>
                      </div>
                    )}
                    {item.spend && (
                      <div style={styles.adsetMetric}>
                        <div style={styles.adsetMetricVal}>{item.spend}</div>
                        <div style={styles.adsetMetricLbl}>Xərc</div>
                      </div>
                    )}
                  </div>
                  {item.verdict && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: '1.5', margin: '10px 0 0 0' }}>{item.verdict}</p>}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          İTEM ANALİZİ (campaign / adset)
      ══════════════════════════════════════ */}
      {!isCreative && items.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div style={styles.sectionHeader}>
            <div style={{ ...styles.sectionDot, background: '#4ecdc4' }} />
            <h2 style={styles.sectionTitle}>{r.data_level === 'adset' ? 'Ad Set' : 'Kampaniya'} Analizi</h2>
          </div>
          <div style={styles.allItems}>
            {items.map((item, i) => {
              const sc = statusColor[item.status] || '#5a5a7a'
              const km = item.key_metrics || {}
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  whileHover={{ x: 4, boxShadow: `0 4px 24px ${sc}18` }}
                  style={{ ...styles.itemRow, borderLeft: `3px solid ${sc}` }}
                >
                  <div style={styles.itemRowLeft}>
                    <div style={{ ...styles.itemScore, color: sc, borderColor: `${sc}44` }}>{item.score}</div>
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <span style={{ ...styles.statusTag, background: `${sc}18`, color: sc }}>{item.status}</span>
                    </div>
                  </div>
                  <div style={styles.itemRowRight}>
                    {km.roas && km.roas !== '<if available>' && <span style={styles.kmPill}><b>ROAS</b> {km.roas}</span>}
                    {km.cpm && <span style={styles.kmPill}><b>CPM</b> {km.cpm}</span>}
                    {km.results && <span style={styles.kmPill}>{km.results}</span>}
                    {item.spend && <span style={styles.kmPill}>{item.spend}</span>}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          BÜDCƏ + PROBLEMLƏR + MÜSBƏTLƏr
      ══════════════════════════════════════ */}
      {(budget.insight || r.top_issues?.length || r.positive_points?.length) && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={styles.bottomGrid}>

          {budget.insight && (
            <div style={styles.infoCard}>
              <div style={styles.infoCardTitle}>💰 Büdcə Analizi</div>
              <div style={styles.budgetRow}>
                <div><div style={styles.budgetKey}>Növ</div><div style={styles.budgetVal}>{budget.type}</div></div>
                {budget.spend_ratio && <div><div style={styles.budgetKey}>Nisbət</div><div style={styles.budgetVal}>{budget.spend_ratio}</div></div>}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>{budget.insight}</p>
            </div>
          )}

          {r.top_issues?.length > 0 && (
            <div style={styles.infoCard}>
              <div style={{ ...styles.infoCardTitle, color: '#ff5c7a' }}>⚠️ Əsas Problemlər</div>
              {r.top_issues.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}
                  style={styles.issueItem}>
                  <span style={{ color: '#ff5c7a', marginRight: '8px', flexShrink: 0 }}>✗</span>{p}
                </motion.div>
              ))}
            </div>
          )}

          {r.positive_points?.length > 0 && (
            <div style={styles.infoCard}>
              <div style={{ ...styles.infoCardTitle, color: '#00d4aa' }}>✅ Müsbət Cəhətlər</div>
              {r.positive_points.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}
                  style={styles.issueItem}>
                  <span style={{ color: '#00d4aa', marginRight: '8px', flexShrink: 0 }}>✓</span>{p}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          TÖVSİYƏLƏR
      ══════════════════════════════════════ */}
      {recs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <div style={styles.sectionHeader}>
            <Lightbulb size={16} color="#ffb347" />
            <h2 style={styles.sectionTitle}>Tövsiyələr</h2>
          </div>
          <div style={styles.recList}>
            {recs.map((rec, i) => {
              const pConf = priorityConfig[rec.priority] || priorityConfig.medium
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 + i * 0.06 }}
                  whileHover={{ x: 4 }}
                  style={{ ...styles.recCard, borderLeft: `3px solid ${pConf.color}` }}
                >
                  <span style={{ ...styles.priorityTag, background: pConf.bg, color: pConf.color }}>{pConf.label}</span>
                  <div style={styles.recTitle}>{rec.action}</div>
                  {rec.reason && <div style={styles.recDesc}><b>Səbəb:</b> {rec.reason}</div>}
                  {rec.expected_impact && <div style={{ ...styles.recDesc, marginTop: '4px' }}><b>Nəticə:</b> {rec.expected_impact}</div>}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Scaling */}
      {r.scaling_recommendation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={styles.scalingBox}>
          <Target size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: '700', marginBottom: '4px', color: 'var(--accent)' }}>Ümumi Tövsiyə</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
              {r.scaling_recommendation}
            </p>
          </div>
        </motion.div>
      )}
    </Layout>
  )
}

const styles = {
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  header: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', flexShrink: 0, marginTop: '4px' },
  backBtnSolid: { marginTop: '16px', padding: '10px 24px', borderRadius: '10px', background: 'var(--gradient)', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer' },
  pageTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '8px', wordBreak: 'break-all' },
  chips: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  chip: { padding: '3px 10px', borderRadius: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' },
  scoreRing: { border: '3px solid', borderRadius: '16px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0, textAlign: 'center', flexDirection: 'column' },
  scoreNum: { fontSize: '34px', fontWeight: '800', lineHeight: 1 },
  scoreSub: { fontSize: '12px', opacity: 0.7 },
  summaryBar: { display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', marginBottom: '28px' },
  statusDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '5px' },
  statusLabel: { fontWeight: '700', fontSize: '15px', display: 'block', marginBottom: '4px' },
  summaryText: { color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.7', margin: 0 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionDot: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 },
  sectionTitle: { fontSize: '17px', fontWeight: '700', margin: 0 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '32px' },
  metCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', transition: 'all 0.3s ease', cursor: 'default' },
  metTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  metLabel: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  metValue: { fontSize: '22px', fontWeight: '800', marginBottom: '10px', lineHeight: 1 },
  metBar: { height: '4px', borderRadius: '4px', overflow: 'hidden' },
  chartSection: { marginBottom: '32px' },
  chartWrap: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px' },
  tooltip: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px' },
  tooltipLabel: { color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px', fontWeight: '600' },
  creativeHighlights: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' },
  highlightCard: { background: 'var(--bg-card)', border: '1px solid', borderRadius: '14px', padding: '18px', transition: 'all 0.3s ease', cursor: 'default' },
  highlightBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', marginBottom: '10px' },
  highlightName: { fontWeight: '700', fontSize: '15px', marginBottom: '8px' },
  highlightMeta: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  kmChip: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
  highlightVerdict: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 10px 0' },
  highlightAction: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,212,170,0.1)', color: '#00d4aa', fontSize: '12px', fontWeight: '500' },
  allItems: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', marginBottom: '28px' },
  itemRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', transition: 'all 0.2s ease', flexWrap: 'wrap' },
  itemRowLeft: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
  itemScore: { width: '38px', height: '38px', borderRadius: '10px', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 },
  itemName: { fontWeight: '600', fontSize: '14px', marginBottom: '3px' },
  statusTag: { padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  itemRowRight: { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' },
  kmPill: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
  creativeIdea: { display: 'flex', gap: '14px', padding: '16px 20px', background: 'rgba(255,179,71,0.07)', border: '1px solid rgba(255,179,71,0.2)', borderRadius: '14px', marginBottom: '28px' },
  bottomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '28px' },
  infoCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' },
  infoCardTitle: { fontWeight: '700', fontSize: '15px', marginBottom: '14px' },
  budgetRow: { display: 'flex', gap: '24px', marginBottom: '12px' },
  budgetKey: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' },
  budgetVal: { fontSize: '17px', fontWeight: '700' },
  issueItem: { padding: '8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', display: 'flex', alignItems: 'flex-start' },
  recList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' },
  recCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', transition: 'all 0.2s ease' },
  priorityTag: { display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', marginBottom: '8px' },
  recTitle: { fontWeight: '600', fontSize: '14px', marginBottom: '8px' },
  recDesc: { color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' },
  scalingBox: { display: 'flex', gap: '14px', padding: '16px 20px', background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '14px', marginBottom: '32px' },
  adsetGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: '28px' },
  adsetCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px', transition: 'all 0.25s ease', cursor: 'default' },
  adsetMetrics: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  adsetMetric: { textAlign: 'center', padding: '8px 4px', background: 'var(--bg-secondary)', borderRadius: '8px' },
  adsetMetricVal: { fontSize: '16px', fontWeight: '800', marginBottom: '2px' },
  adsetMetricLbl: { fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' },
}
