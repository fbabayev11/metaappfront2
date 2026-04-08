import React, { useEffect, useState } from 'react'
import NeuralBackground from '../components/NeuralBackground.jsx'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, FileText, Trash2, TrendingUp, BarChart2, Clock, Bot } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { analysisAPI } from '../api.js'
import { useAuth } from '../App.jsx'

const providerColors = { openai: '#10a37f', claude: '#d4a27f', gemini: '#4285f4', deepseek: '#6c63ff' }
const providerNames = { openai: 'OpenAI GPT-4', claude: 'Claude', gemini: 'Gemini', deepseek: 'DeepSeek' }
const marketLabels = { tr: '🇹🇷 Türkiyə', eu_us: '🌍 AB/ABŞ' }

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    analysisAPI.getAll()
      .then(res => setAnalyses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Bu analizi silmək istəyirsiniz?')) return
    await analysisAPI.delete(id)
    setAnalyses(prev => prev.filter(a => a.id !== id))
  }

  // adset və ad səviyyəlilərini gizlət - yalnız campaign və ya level olmayan görünsün
  const visible = analyses.filter(a => a.data_level !== 'adset' && a.data_level !== 'ad')
  // DEBUG - F12 console-da bax
  const filtered = visible.filter(a => {
    if (!searchQ) return true
    const q = searchQ.toLowerCase()
    const fname = (a.filename||'').toLowerCase()
    const date = (a.created_at||'').toLowerCase()
    const campName = (a.result?.campaign_name||a.result?.items_analysis?.[0]?.name||'').toLowerCase()
    // filename içindəki hər sözü yoxla
    return fname.includes(q) || date.replace('t',' ').includes(q) || campName.includes(q)
  })

  const score = analyses.length > 0
    ? Math.round(analyses.reduce((acc, a) => acc + (a.result?.overall_score || 0), 0) / analyses.length)
    : null

  return (
    <Layout>
      {/* Full page neural background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.35 }}>
        <NeuralBackground color="#6c63ff" trailOpacity={0.06} particleCount={300} speed={0.4} />
      </div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Salam, {user?.name} 👋</h1>
          <p style={styles.pageSubtitle}>Meta Ads analiz panelinə xoş gəldiniz</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/fb-analyze')}
          style={styles.newBtn}
        >
          <PlusCircle size={18} />
          Yeni Analiz
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={styles.statsRow}
      >
        {[
          { icon: FileText, label: 'Ümumi Analiz', value: analyses.length, color: '#6c63ff' },
          { icon: TrendingUp, label: 'Ortalama Skor', value: score ? `${score}/100` : '—', color: '#00d4aa' },
          { icon: BarChart2, label: 'Cəmi Sətir', value: analyses.reduce((a, b) => a + (b.row_count || 0), 0).toLocaleString(), color: '#ffb347' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: `${color}22` }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={styles.statValue}>{value}</div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Analyses list */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 style={styles.sectionTitle}>Analizlər</h2>

        {/* Glowing Search Bar */}
        <div style={{ marginBottom: 20, display:'flex', justifyContent:'center' }}>
          <style>{`
            #poda-dash .glow-wrap { position:absolute; z-index:-1; overflow:hidden; border-radius:12px; }
            #poda-dash .glow-wrap::before {
              content:''; position:absolute; z-index:-2;
              width:600px; height:600px; top:50%; left:50%;
              transform:translate(-50%,-50%) rotate(82deg);
              background:conic-gradient(rgba(0,0,0,0),#18116a,rgba(0,0,0,0) 10%,rgba(0,0,0,0) 50%,#6e1b60,rgba(0,0,0,0) 60%);
              transition:all 2s; filter:blur(3px);
            }
            #poda-dash:hover .glow-wrap::before { transform:translate(-50%,-50%) rotate(-98deg); }
            #poda-dash:focus-within .glow-wrap::before { transform:translate(-50%,-50%) rotate(442deg); transition-duration:4s; }
            #poda-dash .glow-outer::before {
              content:''; position:absolute; z-index:-2;
              width:999px; height:999px; top:50%; left:50%;
              transform:translate(-50%,-50%) rotate(60deg);
              background:conic-gradient(#000,#402fb5 5%,#000 38%,#000 50%,#cf30aa 60%,#000 87%);
              transition:all 2s; filter:blur(3px);
            }
            #poda-dash:hover .glow-outer::before { transform:translate(-50%,-50%) rotate(-120deg); }
            #poda-dash:focus-within .glow-outer::before { transform:translate(-50%,-50%) rotate(420deg); transition-duration:4s; }
            #poda-dash:focus-within .glow-wrap::before { animation: dashGlow 3s linear infinite !important; }
            @keyframes dashGlow { from { transform:translate(-50%,-50%) rotate(0deg); } to { transform:translate(-50%,-50%) rotate(360deg); } }
            #poda-dash .spin-btn::before {
              content:''; position:absolute; width:600px; height:600px; top:50%; left:50%;
              transform:translate(-50%,-50%) rotate(90deg);
              background:conic-gradient(rgba(0,0,0,0),#3d3a4f,rgba(0,0,0,0) 50%,rgba(0,0,0,0) 50%,#3d3a4f,rgba(0,0,0,0));
              filter:brightness(1.35); animation:dashSpin 3s linear infinite;
            }
            @keyframes dashSpin { to { transform:translate(-50%,-50%) rotate(450deg); } }
          `}</style>
          <div id="poda-dash" style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {/* Outer glow */}
            <div className="glow-outer" style={{ position:'absolute', zIndex:-1, overflow:'hidden', height:'100%', width:'100%', maxHeight:70, maxWidth:600, borderRadius:12 }} />
            {/* Inner glows */}
            {[0,1,2].map(i => (
              <div key={i} className="glow-wrap" style={{ height:'100%', width:'100%', maxHeight:65, maxWidth:598 }} />
            ))}
            {/* Input */}
            <div style={{ position:'relative' }}>
              <input
                value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                placeholder="Analiz axtar..."
                style={{ background:'#010201', border:'none', width:580, height:56, borderRadius:12,
                  color:'#fff', paddingLeft:56, paddingRight:56, fontSize:16, outline:'none' }}
              />
              {/* Search icon */}
              <div style={{ position:'absolute', left:18, top:15 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none">
                  <circle stroke="url(#sg)" r="8" cy="11" cx="11"/>
                  <line stroke="url(#sl)" y2="16.65" y1="22" x2="16.65" x1="22"/>
                  <defs>
                    <linearGradient gradientTransform="rotate(50)" id="sg"><stop stopColor="#f8e7f8" offset="0%"/><stop stopColor="#b6a9b7" offset="50%"/></linearGradient>
                    <linearGradient id="sl"><stop stopColor="#b6a9b7" offset="0%"/><stop stopColor="#837484" offset="50%"/></linearGradient>
                  </defs>
                </svg>
              </div>
              {/* Filter btn */}
              <div className="spin-btn" style={{ position:'absolute', height:42, width:40, overflow:'hidden', top:7, right:7, borderRadius:8 }} />
              <div style={{ position:'absolute', top:8, right:8, zIndex:2, height:40, width:38,
                background:'linear-gradient(to bottom, #161329, #000, #1d1b4b)',
                borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg height="22" width="22" viewBox="4.8 4.56 14.832 15.408" fill="none">
                  <path d="M8.16 6.65H15.83C16.47 6.65 16.99 7.17 16.99 7.81V9.09C16.99 9.56 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55 7 9.2V7.87C7 7.17 7.52 6.65 8.16 6.65Z" stroke="#d6d6e6" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {/* Pink mask */}
              <div style={{ pointerEvents:'none', position:'absolute', width:30, height:20,
                background:'#cf30aa', top:10, left:5, filter:'blur(20px)', opacity:0.8 }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <div style={styles.spinner} />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
            <BarChart2 size={48} color="var(--text-muted)" />
            {searchQ ? (
              <p style={styles.emptyText}>"{searchQ}" adında analiz tapılmadı</p>
            ) : (
              <>
                <p style={styles.emptyText}>Hələ analiz yoxdur</p>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/fb-analyze')} style={styles.emptyBtn}>
                  İlk Analizinizi Başladın
                </motion.button>
              </>
            )}
          </motion.div>
        ) : (
          <div style={styles.analysisList}>
            <AnimatePresence>
              {filtered.map((analysis, idx) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  onClick={() => {
                    // Eyni group_id-li 3 analizi tap
                    if (analysis.group_id && analysis.data_level === 'campaign') {
                      const grp = analyses.filter(a => a.group_id === analysis.group_id)
                      const camp = grp.find(a => a.data_level === 'campaign')
                      const adset = grp.find(a => a.data_level === 'adset')
                      const ad = grp.find(a => a.data_level === 'ad')
                      if (camp && adset && ad) {
                        navigate(`/results-combined/${camp.id}/${adset.id}/${ad.id}`)
                        return
                      }
                    }
                    // Fallback - tək ID
                    navigate(`/results-combined/${analysis.id}`)
                  }}
                  style={styles.analysisCard}
                  whileHover={{ scale: 1.01, borderColor: 'var(--border-bright)' }}
                >
                  <div style={styles.analysisIcon}>
                    <Bot size={20} color={providerColors[analysis.ai_provider] || '#6c63ff'} />
                  </div>
                  <div style={styles.analysisInfo}>
                    <div style={styles.analysisName}>
                      {(() => {
                        try {
                          const date = new Date(analysis.created_at).toLocaleDateString('az-AZ', {day:'2-digit',month:'2-digit',year:'numeric'}).replace(/\//g,'.')
                          const cleanName = analysis.filename
                            .replace(/^Facebook_/i, '')
                            .replace(/[.]csv$/i, '')
                            .replace(/_/g, ' ')
                            .trim()
                          return cleanName + ' — ' + date
                        } catch(e) { return analysis.filename }
                      })()}
                    </div>
                    <div style={styles.analysisMeta}>
                      <span style={{ ...styles.badge, background: `${providerColors[analysis.ai_provider]}22`, color: providerColors[analysis.ai_provider] }}>
                        {providerNames[analysis.ai_provider]}
                      </span>
                      <span style={styles.metaText}>{marketLabels[analysis.market]}</span>
                      <span style={styles.metaText}>{analysis.row_count} sətir</span>
                    </div>
                  </div>
                  <div style={styles.analysisRight}>
                    {analysis.result?.overall_score !== undefined && (
                      <div style={{
                        ...styles.scoreBadge,
                        background: analysis.result.overall_score >= 70 ? 'rgba(0,212,170,0.15)' : analysis.result.overall_score >= 40 ? 'rgba(255,179,71,0.15)' : 'rgba(255,92,122,0.15)',
                        color: analysis.result.overall_score >= 70 ? 'var(--success)' : analysis.result.overall_score >= 40 ? 'var(--warning)' : 'var(--danger)',
                      }}>
                        {analysis.result.overall_score}/100
                      </div>
                    )}
                    <div style={styles.dateText}>
                      <Clock size={12} />
                      {new Date(analysis.created_at).toLocaleDateString('az-AZ').replace(/\//g,'.')}
                    </div>
                    <button onClick={(e) => handleDelete(analysis.id, e)} style={styles.deleteBtn}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </Layout>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', marginBottom: '6px' },
  pageSubtitle: { color: 'var(--text-secondary)', fontSize: '15px' },
  newBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', background: 'var(--gradient)', color: '#fff', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 20px var(--accent-glow)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' },
  statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '24px', fontWeight: '700', marginBottom: '2px' },
  statLabel: { color: 'var(--text-secondary)', fontSize: '13px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '16px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 32px', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' },
  emptyText: { color: 'var(--text-secondary)', fontSize: '16px' },
  emptyBtn: { padding: '12px 24px', borderRadius: '10px', background: 'var(--gradient)', color: '#fff', fontWeight: '600' },
  spinner: { width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' },
  analysisList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  analysisCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'rgba(13,13,26,0.88)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' },
  analysisIcon: { width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  analysisInfo: { flex: 1, minWidth: 0 },
  analysisName: { fontWeight: '600', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  analysisMeta: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  badge: { padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  metaText: { fontSize: '12px', color: 'var(--text-muted)' },
  analysisRight: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 },
  scoreBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  dateText: { display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' },
  deleteBtn: { background: 'none', color: 'var(--text-muted)', padding: '6px', borderRadius: '8px', display: 'flex', transition: 'color 0.2s' },
}
