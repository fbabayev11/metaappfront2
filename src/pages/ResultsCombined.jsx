import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ArrowLeft, TrendingUp, Target, Zap, CheckCircle, AlertTriangle, Loader2, ChevronDown } from 'lucide-react'
import Layout from '../components/Layout.jsx'
import { analysisAPI } from '../api.js'

const STATUS_COLOR = { 'Əla':'#00d4aa','Mükemmel':'#00d4aa','Yaxşı':'#4ecdc4','Orta':'#f59e0b','Zəif':'#f43f5e','Kritik':'#ef4444' }
const scoreColor = s => s>=70?'#00d4aa':s>=50?'#f59e0b':'#f43f5e'
const parse = v => { const n=parseFloat(String(v||0).replace(/[^0-9.-]/g,'')); return isNaN(n)?0:n }

const CURRENCIES = [
  {code:'EUR',symbol:'€',label:'Euro'},
  {code:'USD',symbol:'$',label:'Dollar'},
  {code:'TRY',symbol:'₺',label:'Türk Lirəsi'},
  {code:'AZN',symbol:'₼',label:'Manat'},
  {code:'GBP',symbol:'£',label:'Sterlinq'},
  {code:'CHF',symbol:'₣',label:'Frank'},
  {code:'CAD',symbol:'C$',label:'Kanada $'},
  {code:'AUD',symbol:'A$',label:'Avstraliya $'},
]

function FluidCurrencySelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(null)
  const ref = useRef()
  const cur = CURRENCIES.find(c=>c.code===value)||CURRENCIES[0]

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position:'relative', minWidth:165 }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, width:'100%',
          padding:'9px 14px', borderRadius:10,
          border: open?'1px solid rgba(167,139,250,0.5)':'1px solid rgba(255,255,255,0.1)',
          background: open?'rgba(167,139,250,0.1)':'rgba(255,255,255,0.05)',
          color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
        <span>{cur.symbol} {cur.code}</span>
        <motion.div animate={{ rotate: open?180:0 }} transition={{ duration:0.2 }}>
          <ChevronDown size={14} color="#64748b" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
            transition={{type:'spring',stiffness:500,damping:30}}
            style={{ position:'absolute', top:'110%', left:0, right:0, zIndex:300,
              background:'#0a0a14', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:12, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ padding:6 }}>
              {CURRENCIES.map((c,idx) => (
                <button key={c.code}
                  onMouseEnter={()=>setHovered(c.code)} onMouseLeave={()=>setHovered(null)}
                  onClick={()=>{ onChange(c.code); setOpen(false) }}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%',
                    padding:'8px 12px', border:'none',
                    background: hovered===c.code?'rgba(167,139,250,0.12)':'transparent',
                    color: c.code===value?'#a78bfa':'#e2e8f0',
                    fontSize:13, fontWeight: c.code===value?800:400,
                    cursor:'pointer', borderRadius:8, textAlign:'left', transition:'background 0.15s' }}>
                  <span style={{ fontSize:16, fontWeight:900, minWidth:26, color:'#fff' }}>{c.symbol}</span>
                  <span>{c.label}</span>
                  <span style={{ marginLeft:'auto', fontSize:11, color:'#475569' }}>{c.code}</span>
                  {c.code===value && <CheckCircle size={13} color="#a78bfa" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Metrics Panel ────────────────────────────────────────────────────────────
const PANEL_CATEGORIES = {
  'Nəticələr': ['Purchases','Purchase conversion value','Landing page views','Leads','Adds to cart','Checkouts initiated','Registrations completed','Content views','App installs','Subscriptions','ThruPlays','Omni purchases'],
  'Xərc & ROAS': ['Amount spent','Purchase ROAS (return on ad spend)','Cost per purchase','Cost per ATC','Cost per checkout','Cost per landing page view','CPC (Cost per link click)','Cost per lead','CPM (cost per 1,000 impressions) (EUR)'],
  'Göstəriş & Çatış': ['Impressions','Reach','Frequency','CPM (cost per 1,000 impressions) (EUR)'],
  'Tıklamalar': ['Clicks (all)','Link clicks','CPC (all)','CTR (all)','Outbound clicks','Outbound CTR'],
  'Video': ['Video plays','Video plays at 25%','Video plays at 50%','Video plays at 75%','Video watched at 100%','Hook Rate','Thumbstop Rate','Hold Rate','Completion Rate','Video avg play time'],
  'Etkileşim': ['Post engagement','Page engagement','Post shares','Post comments','Post reactions','Post saves','Photo views','Page likes','Instagram follows'],
  'Mesajlaşma': ['Messaging conversations'],
}

function MetricsPanel({ items }) {
  const [open, setOpen] = useState(false)
  const [selItem, setSelItem] = useState(0)
  const [selCat, setSelCat] = useState('Nəticələr')
  if (!items?.length) return null

  const item = items[selItem]
  const raw = item?.metrics_raw || {}

  const catMetrics = PANEL_CATEGORIES[selCat] || []
  const available = catMetrics.filter(k => {
    const v = raw[k]
    return v !== undefined && v !== null && v !== 0 && v !== '' && !String(v).includes('<')
  })

  return (
    <div style={{ marginBottom:16 }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', borderRadius:10,
          border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)',
          color:'#94a3b8', fontSize:13, fontWeight:600, cursor:'pointer', width:'100%' }}>
        <span>📊</span>
        <span>Tam Metrik Cədvəli</span>
        <ChevronDown size={14} style={{ marginLeft:'auto', transform: open?'rotate(180deg)':'none', transition:'0.2s' }}/>
      </button>

      {open && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          style={{ marginTop:8, background:'rgba(8,8,18,0.95)', borderRadius:14,
            border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>

          {/* Item seçimi */}
          {items.length > 1 && (
            <div style={{ display:'flex', gap:6, padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexWrap:'wrap' }}>
              {items.map((it,i) => (
                <button key={i} onClick={()=>setSelItem(i)}
                  style={{ padding:'4px 12px', borderRadius:20, border:'none', fontSize:12, fontWeight:600,
                    background: selItem===i?'rgba(108,99,255,0.3)':'rgba(255,255,255,0.06)',
                    color: selItem===i?'#a78bfa':'#64748b', cursor:'pointer' }}>
                  {(it.name||'').slice(0,18)}
                </button>
              ))}
            </div>
          )}

          {/* Kateqoriya tabları */}
          <div style={{ display:'flex', gap:4, padding:'8px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexWrap:'wrap' }}>
            {Object.keys(PANEL_CATEGORIES).map(cat => (
              <button key={cat} onClick={()=>setSelCat(cat)}
                style={{ padding:'4px 12px', borderRadius:20, border:'none', fontSize:11, fontWeight:600,
                  background: selCat===cat?'rgba(0,212,170,0.2)':'rgba(255,255,255,0.05)',
                  color: selCat===cat?'#00d4aa':'#64748b', cursor:'pointer' }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Metrik dəyərləri */}
          <div style={{ padding:'10px 14px', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:8 }}>
            {catMetrics.length === 0 ? (
              <div style={{ color:'#475569', fontSize:13, padding:8 }}>Bu kateqoriyada metrik yoxdur</div>
            ) : catMetrics.map(k => {
              const v = raw[k]
              const hasVal = v !== undefined && v !== null && v !== '' && !String(v).includes('<')
              return (
                <div key={k} style={{ padding:'8px 12px', borderRadius:8,
                  background: hasVal ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                  border: `1px solid ${hasVal?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.03)'}` }}>
                  <div style={{ fontSize:10, color:'#475569', fontWeight:600, marginBottom:4 }}>{k}</div>
                  <div style={{ fontSize:15, fontWeight:800, color: hasVal?'#ffffff':'#334155' }}>
                    {hasVal ? (typeof v === 'number' ? v.toLocaleString('az-AZ',{maximumFractionDigits:2}) : v) : '—'}
                  </div>
                </div>
              )
            })}
          </div>

          {available.length === 0 && catMetrics.length > 0 && (
            <div style={{ padding:'12px 14px', color:'#334155', fontSize:12, textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
              Bu kateqoriyada bu kreativ üçün məlumat yoxdur
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function ScoreRing({ score, size=80 }) {
  const c = scoreColor(score)
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', border:`3px solid ${c}`,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      flexShrink:0, background:`${c}08` }}>
      <div style={{ fontSize:size*0.3, fontWeight:900, color:c, lineHeight:1 }}>{score}</div>
      <div style={{ fontSize:size*0.14, color:'#475569', fontWeight:600 }}>/ 100</div>
    </div>
  )
}

function MetricCard({ label, value, color='#6c63ff', delay=0 }) {
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay}}
      whileHover={{y:-2}}
      style={{ padding:'18px 20px', borderRadius:14, background:'rgba(255,255,255,0.02)',
        border:`1px solid ${color}20`, borderTop:`3px solid ${color}` }}>
      <div style={{ fontSize:11, color:'#475569', fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:900, color:'#ffffff' }}>{value}</div>
    </motion.div>
  )
}

const CHART_METRICS = [
  // Nəticələr
  {id:'ROAS',          label:'ROAS',                 color:'#00d4aa', cat:'Nəticə'},
  {id:'Skor',          label:'Skor',                 color:'#6c63ff', cat:'Nəticə'},
  {id:'Purchases',     label:'Alışlar',              color:'#34d399', cat:'Nəticə'},
  {id:'Purchase_value',label:'Alış Dəyəri',          color:'#10b981', cat:'Nəticə'},
  {id:'Leads',         label:'Lead',                 color:'#06b6d4', cat:'Nəticə'},
  {id:'ATC',           label:'Səbətə Əlavə',         color:'#0ea5e9', cat:'Nəticə'},
  {id:'Checkout',      label:'Checkout',             color:'#8b5cf6', cat:'Nəticə'},
  {id:'LPV',           label:'LPV',                  color:'#7c3aed', cat:'Nəticə'},
  {id:'Registrations', label:'Qeydiyyat',            color:'#4f46e5', cat:'Nəticə'},
  // Xərc
  {id:'Spend',         label:'Xərc',                 color:'#fb923c', cat:'Xərc'},
  {id:'CPA',           label:'CPA',                  color:'#f97316', cat:'Xərc'},
  {id:'CPC',           label:'CPC',                  color:'#ef4444', cat:'Xərc'},
  {id:'CPM',           label:'CPM',                  color:'#f59e0b', cat:'Xərc'},
  // Göstəriş
  {id:'Impressions',   label:'Göstərişlər',          color:'#fbbf24', cat:'Göstəriş'},
  {id:'Reach',         label:'Çatış',                color:'#f59e0b', cat:'Göstəriş'},
  {id:'Frequency',     label:'Sıxlıq',               color:'#d97706', cat:'Göstəriş'},
  // Tıklama
  {id:'CTR',           label:'CTR',                  color:'#60a5fa', cat:'Tıklama'},
  {id:'Clicks',        label:'Kliklər',              color:'#3b82f6', cat:'Tıklama'},
  {id:'Link_clicks',   label:'Link Tıklamaları',     color:'#2563eb', cat:'Tıklama'},
  {id:'Outbound_CTR',  label:'Kənara CTR',           color:'#1d4ed8', cat:'Tıklama'},
  // Video
  {id:'Hook',          label:'Hook Rate',            color:'#a78bfa', cat:'Video'},
  {id:'Thumbstop',     label:'Thumbstop',            color:'#f472b6', cat:'Video'},
  {id:'Hold',          label:'Hold Rate',            color:'#e879f9', cat:'Video'},
  {id:'Completion',    label:'Completion Rate',      color:'#d946ef', cat:'Video'},
  {id:'Thruplays',     label:'ThruPlay',             color:'#c026d3', cat:'Video'},
  // Etkileşim
  {id:'Post_engagement',label:'Göndəri Etkileşimi', color:'#64748b', cat:'Etkileşim'},
  {id:'Page_likes',    label:'Bəyənmələr',           color:'#475569', cat:'Etkileşim'},
]
const CHART_CATS = [...new Set(CHART_METRICS.map(m=>m.cat))]

function CreativeChart({ items }) {
  const [active, setActive] = useState(['ROAS','CPM','CPC','CTR','Spend'])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const toggle = id => setActive(prev => prev.includes(id)?(prev.length>1?prev.filter(m=>m!==id):prev):[...prev,id])
  const p = v=>{const n=parseFloat(String(v||0).replace(/[€$₺₼£a-zA-Z,]/g,'').trim());return isNaN(n)?0:n}
  const chartData = items.slice(0,10).map(item => {
    const km = item.key_metrics||{}
    const raw = item.metrics_raw||{}
    return {
      name:(item.name||'').slice(0,13),
      ROAS:p(km.roas||raw['Purchase ROAS']),
      Skor:item.score||0,
      CPM:p(km.cpm||raw['CPM (Cost per 1,000 Impressions)']),
      CTR:p(km.ctr||raw['CTR (Link Click-Through Rate)']),
      Hook:p(km.hook_rate), Thumbstop:p(km.thumbstop),
      Purchases:p(km.purchases||raw['Purchases']),
      Purchase_value:p(raw['Purchase conversion value']),
      Leads:p(raw['Leads']),
      ATC:p(raw['Adds to Cart']||km.atc),
      Checkout:p(raw['Checkouts initiated']||km.checkout),
      LPV:p(raw['Landing page views']||km.lpv),
      Spend:p(km.spend||raw['Amount spent']),
      CPA:p(raw['Cost per purchase']),
      CPC:p(km.cpc||raw['CPC (Cost per link click)']),
      Impressions:p(raw['Impressions']||km.impressions),
      Reach:p(raw['Reach']||km.reach),
      Frequency:p(raw['Frequency']||km.frequency),
      Clicks:p(raw['Clicks (all)']||km.clicks),
      Link_clicks:p(raw['Link clicks']),
      Outbound_CTR:p(raw['Outbound CTR (link click-through rate)']),
      Hold:p(km.hold_rate), Completion:p(km.completion_rate),
      Thruplays:p(raw['ThruPlays']),
      Post_engagement:p(raw['Post engagement']),
      Page_likes:p(raw['Page likes']),
      Registrations:p(raw['Registrations completed']),
    }
  })
  const suggestions = CHART_METRICS.filter(m=>
    !active.includes(m.id) &&
    (filterCat ? m.cat===filterCat : true) &&
    (search ? m.label.toLowerCase().includes(search.toLowerCase()) : !filterCat ? false : true)
  )
  return (
    <div style={{ background:'rgba(10,10,20,0.9)', borderRadius:16, padding:'20px 22px', marginBottom:20, border:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        <span style={{ fontSize:13, fontWeight:800, color:'#fff', marginRight:4 }}>Kreativ Müqayisəsi</span>
        {active.map(id=>{
          const m=CHART_METRICS.find(x=>x.id===id); if(!m) return null
          return <motion.button key={id} onClick={()=>toggle(id)} whileTap={{scale:0.95}}
            style={{ padding:'4px 12px', borderRadius:20, border:`1px solid ${m.color}40`,
              background:`${m.color}15`, color:m.color, fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {m.label} ×
          </motion.button>
        })}
        <div style={{ position:'relative', marginLeft:'auto' }}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setFilterCat('')}}
            onFocus={()=>setFilterCat(filterCat||'')}
            onBlur={()=>setTimeout(()=>{setSearch('');setFilterCat('')},250)}
            placeholder="+ Metrik əlavə et..."
            style={{ padding:'6px 14px', borderRadius:20, border:'1px solid rgba(255,255,255,0.1)',
              background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:12, outline:'none', width:170 }} />
          {(suggestions.length>0 || filterCat || search) && (
            <div style={{ position:'absolute', top:'115%', right:0, width:280, background:'#0a0a14',
              border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, zIndex:200,
              boxShadow:'0 16px 48px rgba(0,0,0,0.7)', overflow:'hidden' }}>
              {/* Kateqoriya tabları */}
              <div style={{ display:'flex', gap:4, padding:'8px 8px 4px', flexWrap:'wrap', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {CHART_CATS.map(cat=>(
                  <button key={cat} onMouseDown={()=>setFilterCat(c=>c===cat?'':cat)}
                    style={{ padding:'3px 10px', borderRadius:20, border:'none', fontSize:11, fontWeight:600,
                      cursor:'pointer', background: filterCat===cat?'rgba(108,99,255,0.3)':'rgba(255,255,255,0.07)',
                      color: filterCat===cat?'#a78bfa':'#94a3b8' }}>
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{ maxHeight:240, overflowY:'auto', padding:6 }}>
                {suggestions.length>0 ? suggestions.map(m=>(
                  <button key={m.id} onMouseDown={()=>{toggle(m.id);setSearch('');setFilterCat('')}}
                    style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'7px 10px', border:'none',
                      background:'transparent', color:'#e2e8f0', fontSize:13, cursor:'pointer', textAlign:'left', borderRadius:8 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:m.color, flexShrink:0 }}/>
                    <span>{m.label}</span>
                    <span style={{ fontSize:10, color:'#475569', marginLeft:'auto' }}>{m.cat}</span>
                  </button>
                )) : (
                  <div style={{ padding:'12px', color:'#475569', fontSize:12, textAlign:'center' }}>
                    {filterCat ? `${filterCat} kateqoriyası seçildi` : 'Axtarın...'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={chartData} margin={{top:5,right:10,left:-10,bottom:55}} barSize={13} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
          <XAxis dataKey="name" tick={{fill:'#94a3b8',fontSize:10}} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:'#64748b',fontSize:10}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#fff',fontSize:12}}/>
          {CHART_METRICS.filter(m=>active.includes(m.id)).map(m=>(
            <Bar key={m.id} dataKey={m.id} name={m.label} fill={m.color} radius={[5,5,0,0]} fillOpacity={0.9}/>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function Section({ title, icon, color='#6c63ff', delay=0, children }) {
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay}}
      style={{ background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.06)',
        borderLeft:`3px solid ${color}`, borderRadius:18, padding:'24px 28px', marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
        <div style={{ color }}>{icon}</div>
        <h2 style={{ fontSize:18, fontWeight:900, margin:0, color:'#ffffff' }}>{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

function Issues({ items, fmt2 }) {
  if (!items?.length) return null
  const clean = (t) => fmt2 ? fmt2(t) : t
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:11, fontWeight:800, color:'#f43f5e', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>⚠ Problemlər</div>
      {items.map((t,i)=>(
        <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:'#cbd5e1', marginBottom:6, lineHeight:1.65 }}>
          <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink:0, marginTop:3 }}/> {clean(t)}
        </div>
      ))}
    </div>
  )
}

function Recs({ items, fmt2 }) {
  if (!items?.length) return null
  const clean = (t) => fmt2 ? fmt2(t) : t
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:800, color:'#00d4aa', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>✓ Tövsiyələr</div>
      {items.slice(0,4).map((r,i)=>(
        <div key={i} style={{ display:'flex', gap:8, fontSize:13, color:'#cbd5e1', marginBottom:6, lineHeight:1.65 }}>
          <CheckCircle size={13} color="#00d4aa" style={{ flexShrink:0, marginTop:3 }}/> {clean(typeof r==='string'?r:r.action||r.title||'')}
        </div>
      ))}
    </div>
  )
}

export default function ResultsCombined() {
  const params = useParams()
  const campaignId = params.campaignId||params.id
  const adsetId    = params.adsetId
  const adId       = params.adId
  const navigate   = useNavigate()
  const [data, setData]       = useState({campaign:null,adset:null,ad:null})
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [currency, setCurrency] = useState('EUR')

  useEffect(()=>{
    const load = async () => {
      try {
        const extract = r => { const d=r.data||r; return {...d, result:typeof d.result==='string'?JSON.parse(d.result):(d.result||{})} }
        if (adsetId && adId) {
          const [c,a,ad] = await Promise.all([analysisAPI.getById(campaignId),analysisAPI.getById(adsetId),analysisAPI.getById(adId)])
          const campaign=extract(c), adset=extract(a), adRes=extract(ad)
          setData({campaign,adset,ad:adRes})
          const ci = campaign.result?.campaign_info||adset.result?.campaign_info||{}
          if (ci.currency) setCurrency(ci.currency)
        } else {
          const single = extract(await analysisAPI.getById(campaignId))
          const ci = single.result?.campaign_info||{}
          if (ci.currency) setCurrency(ci.currency)
          const level = single.result?.data_level
          if (level==='campaign') setData({campaign:single,adset:null,ad:null})
          else if (level==='adset') setData({campaign:null,adset:single,ad:null})
          else setData({campaign:null,adset:null,ad:single})
        }
      } catch(e){ setError('Analizlər yüklənmədi') }
      finally { setLoading(false) }
    }
    load()
  },[campaignId,adsetId,adId])

  const cur = CURRENCIES.find(c=>c.code===currency)||CURRENCIES[0]
  const replaceKnownCurrencies = (text) => {
    if (!text) return text
    const sym = cur.symbol
    return text
      .replace(/\b(\d[\d.,]*)\s*(EUR|USD|TRY|AZN|GBP)/g, (_, num, code) => `${sym}${num}`)
      .replace(/[€$₺₼£](\d[\d.,]*)/g, (_, num) => `${sym}${num}`)
  }
  const fmt = v => `${cur.symbol}${parse(v).toLocaleString('az-AZ',{minimumFractionDigits:2,maximumFractionDigits:2})}`

  if (loading) return <Layout><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',gap:12,color:'#64748b'}}><Loader2 size={24} style={{animation:'spin 1s linear infinite'}}/>Yüklənir...<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div></Layout>
  if (error)   return <Layout><div style={{padding:40,color:'#f43f5e'}}>{error}</div></Layout>

  const {campaign,adset,ad} = data
  const cr  = campaign?.result||{}
  const ar  = adset?.result||{}
  const adr = ad?.result||{}
  const cd  = cr.derived_metrics||ar.derived_metrics||{}
  const spend   = parse(cd.spend)
  const roas    = parse(cd.roas)
  const revenue = spend*roas
  const cScore  = cr.overall_score||ar.overall_score||adr.overall_score||cr.score||ar.score||adr.score||0
  const filename = campaign?.filename||adset?.filename||ad?.filename||''
  const displayName = filename.replace(/^Facebook_/i,'').replace(/[._]/g,' ').replace(/csv$/i,'').trim()
  const aiProvider  = campaign?.ai_provider||adset?.ai_provider||ad?.ai_provider||''
  const campaignInfo = cr.campaign_info||ar.campaign_info||adr.campaign_info||{}

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; }
      `}</style>

      {/* Header */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        style={{display:'flex',alignItems:'center',gap:16,marginBottom:24,flexWrap:'wrap'}}>
        <button onClick={()=>navigate('/')}
          style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:10,
            border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',
            color:'#e2e8f0',cursor:'pointer',fontSize:14,fontWeight:600}}>
          <ArrowLeft size={15}/> Geri
        </button>
        <div style={{flex:1}}>
          <h1 style={{fontSize:22,fontWeight:900,color:'#ffffff',marginBottom:6}}>{displayName||'Analiz Nəticəsi'}</h1>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {aiProvider && <span style={{fontSize:12,padding:'3px 10px',borderRadius:20,background:'rgba(108,99,255,0.15)',color:'#a78bfa',fontWeight:700}}>{aiProvider.toUpperCase()}</span>}
            <span style={{fontSize:12,padding:'3px 10px',borderRadius:20,background:'rgba(0,212,170,0.1)',color:'#00d4aa',fontWeight:700}}>Tam Analiz</span>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          <div style={{fontSize:10,color:'#475569',fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Məzənnə</div>
          <FluidCurrencySelect value={currency} onChange={setCurrency}/>
        </div>
        <ScoreRing score={cScore}/>
      </motion.div>

      {/* Campaign info banner */}
      {Object.values(campaignInfo).some(v=>v) && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.05}}
          style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20,padding:'14px 18px',
            background:'rgba(167,139,250,0.05)',border:'1px solid rgba(167,139,250,0.15)',borderRadius:14}}>
          {campaignInfo.objective && <span style={{fontSize:12,padding:'4px 12px',borderRadius:20,background:'rgba(167,139,250,0.12)',color:'#a78bfa',fontWeight:600}}>🎯 {campaignInfo.objective}</span>}
          {campaignInfo.currency && <span style={{fontSize:12,padding:'4px 12px',borderRadius:20,background:'rgba(0,212,170,0.1)',color:'#00d4aa',fontWeight:600}}>💱 {cur.symbol} {campaignInfo.currency}</span>}
          {campaignInfo.target_audience && <span style={{fontSize:12,padding:'4px 12px',borderRadius:20,background:'rgba(251,146,60,0.1)',color:'#fb923c',fontWeight:600}}>👥 {campaignInfo.target_audience.slice(0,60)}{campaignInfo.target_audience.length>60?'…':''}</span>}
          {campaignInfo.product_desc && <span style={{fontSize:12,padding:'4px 12px',borderRadius:20,background:'rgba(96,165,250,0.1)',color:'#60a5fa',fontWeight:600}}>📦 {campaignInfo.product_desc.slice(0,70)}{campaignInfo.product_desc.length>70?'…':''}</span>}
        </motion.div>
      )}

      {/* Top metrics */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        <MetricCard label="Ümumi Xərc"     value={fmt(spend)}            color="#fb923c" delay={0.06}/>
        <MetricCard label="ROAS"            value={`${roas.toFixed(2)}x`} color={roas>=3?'#00d4aa':'#f59e0b'} delay={0.09}/>
        <MetricCard label="Gəlir (est.)"    value={fmt(revenue)}          color="#a78bfa" delay={0.12}/>
        <MetricCard label="Kampaniya Skoru" value={`${cScore}/100`}       color={scoreColor(cScore)} delay={0.15}/>
      </div>

      {/* Campaign */}
      {(cr.summary||cr.items_analysis?.length>0) && (
        <Section title="Kampaniya Analizi" icon={<Target size={17}/>} color="#6c63ff" delay={0.1}>
          {cr.summary && <p style={{color:'#cbd5e1',fontSize:14,lineHeight:1.8,marginBottom:16}}>{replaceKnownCurrencies(cr.summary)}</p>}
          <Issues items={cr.top_issues} fmt2={replaceKnownCurrencies}/><Recs items={cr.recommendations} fmt2={replaceKnownCurrencies}/>
        </Section>
      )}

      {/* Ad Sets */}
      {ar.items_analysis?.length>0 && (
        <Section title="Ad Set Analizi" icon={<TrendingUp size={17}/>} color="#00d4aa" delay={0.15}>
          {ar.summary && <p style={{color:'#cbd5e1',fontSize:14,lineHeight:1.8,marginBottom:16}}>{replaceKnownCurrencies(ar.summary)}</p>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14,marginBottom:16}}>
            {ar.items_analysis.map((item,i) => {
              const sc=STATUS_COLOR[item.status]||'#5a5a7a', km=item.key_metrics||{}
              return (
                <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2+i*0.04}}
                  whileHover={{y:-2}}
                  style={{background:'rgba(255,255,255,0.03)',borderRadius:14,padding:'18px 20px',
                    border:`1px solid ${sc}20`,borderTop:`3px solid ${sc}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                    <div style={{fontWeight:800,fontSize:15,color:'#ffffff',flex:1,lineHeight:1.4}}>{item.name}</div>
                    <span style={{fontSize:12,padding:'3px 10px',borderRadius:20,background:`${sc}18`,color:sc,fontWeight:700,flexShrink:0,marginLeft:8}}>{item.status}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:12}}>
                    {[
                      {label:'ROAS',val:km.roas&&km.roas!=='<if available>'?`${parse(km.roas).toFixed(1)}x`:null,color:parse(km.roas)>=3?'#00d4aa':'#f59e0b'},
                      {label:'CPM',val:km.cpm?fmt(parse(String(km.cpm||0).replace(/[€$₺₼£a-zA-Z]/g,'').trim())):null,color:'#f59e0b'},
                      {label:'Alış',val:km.purchases&&km.purchases!=='<if available>'?parse(km.purchases):null,color:'#a78bfa'},
                    ].filter(x=>x.val!==null).map(x=>(
                      <div key={x.label} style={{textAlign:'center',padding:'8px 4px',background:'rgba(255,255,255,0.04)',borderRadius:10}}>
                        <div style={{fontSize:17,fontWeight:900,color:'#ffffff',marginBottom:2}}>{x.val}</div>
                        <div style={{fontSize:10,color:'#475569',fontWeight:700,textTransform:'uppercase'}}>{x.label}</div>
                      </div>
                    ))}
                  </div>
                  {item.verdict && <p style={{fontSize:13,color:'#94a3b8',lineHeight:1.7,margin:0}}>{replaceKnownCurrencies(item.verdict)}</p>}
                </motion.div>
              )
            })}
          </div>
          <Issues items={ar.top_issues} fmt2={replaceKnownCurrencies}/>
        </Section>
      )}

      {/* Creatives */}
      {adr.items_analysis?.length>0 && (
        <Section title="Kreativ Analizi" icon={<Zap size={17}/>} color="#f59e0b" delay={0.2}>
          {adr.summary && <p style={{color:'#cbd5e1',fontSize:14,lineHeight:1.8,marginBottom:16}}>{replaceKnownCurrencies(adr.summary)}</p>}
          {adr.items_analysis.length>1 && <CreativeChart items={adr.items_analysis}/>}
          <MetricsPanel items={adr.items_analysis}/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:18}}>
            {adr.items_analysis.map((item,i) => {
              const sc=STATUS_COLOR[item.status]||'#5a5a7a', km=item.key_metrics||{}
              return (
                <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25+i*0.05}}
                  whileHover={{y:-4,boxShadow:`0 16px 48px ${sc}18`}}
                  style={{background:'rgba(8,8,18,0.95)',borderRadius:18,padding:'22px 24px',
                    border:`1px solid ${sc}18`,borderTop:`3px solid ${sc}`,transition:'box-shadow 0.3s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                    <div style={{fontWeight:900,fontSize:16,color:'#ffffff',flex:1,lineHeight:1.35}}>{item.name}</div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0,marginLeft:10}}>
                      <span style={{fontSize:12,padding:'4px 10px',borderRadius:20,background:`${sc}18`,color:sc,fontWeight:700}}>{item.status}</span>
                      <span style={{fontSize:15,fontWeight:900,color:scoreColor(item.score)}}>{item.score}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
                    {km.roas&&km.roas!=='<if available>'&&<div style={{padding:'8px 14px',borderRadius:10,background:'rgba(0,212,170,0.1)',border:'1px solid rgba(0,212,170,0.2)',minWidth:70,textAlign:'center'}}>
                      <div style={{fontSize:11,color:'#00d4aa',fontWeight:700,marginBottom:3}}>ROAS</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#fff'}}>{parse(km.roas).toFixed(2)}x</div>
                    </div>}
                    {km.cpm&&<div style={{padding:'8px 14px',borderRadius:10,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',minWidth:80,textAlign:'center'}}>
                      <div style={{fontSize:11,color:'#f59e0b',fontWeight:700,marginBottom:3}}>CPM</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#fff'}}>{fmt(parse(String(km.cpm||0).replace(/[€$₺₼£a-zA-Z]/g,'').trim()))}</div>
                    </div>}
                    {km.hook_rate&&km.hook_rate!=='<if video>'&&<div style={{padding:'8px 14px',borderRadius:10,background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.2)',minWidth:70,textAlign:'center'}}>
                      <div style={{fontSize:11,color:'#a78bfa',fontWeight:700,marginBottom:3}}>HOOK</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#fff'}}>{String(km.hook_rate).replace(/%/g,'').trim()}%</div>
                    </div>}
                    {km.ctr&&km.ctr!=='<if available>'&&<div style={{padding:'8px 14px',borderRadius:10,background:'rgba(96,165,250,0.1)',border:'1px solid rgba(96,165,250,0.2)',minWidth:70,textAlign:'center'}}>
                      <div style={{fontSize:11,color:'#60a5fa',fontWeight:700,marginBottom:3}}>CTR</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#fff'}}>{km.ctr}%</div>
                    </div>}
                  </div>
                  {item.verdict&&<p style={{fontSize:14,color:'#cbd5e1',lineHeight:1.8,marginBottom:14}}>{replaceKnownCurrencies(item.verdict)}</p>}
                  {item.action&&<div style={{padding:'11px 16px',borderRadius:12,background:'rgba(0,212,170,0.07)',borderLeft:'3px solid #00d4aa'}}>
                    <p style={{fontSize:14,color:'#00d4aa',fontWeight:800,margin:0}}>→ {item.action}</p>
                  </div>}
                </motion.div>
              )
            })}
          </div>
          <div style={{marginTop:20}}><Issues items={adr.top_issues} fmt2={replaceKnownCurrencies}/><Recs items={adr.recommendations} fmt2={replaceKnownCurrencies}/></div>
        </Section>
      )}
    </Layout>
  )
}
