import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout.jsx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { API_BASE } from '../api.js'
import { TrendingUp, AlertCircle, RefreshCw, ChevronDown, ChevronRight, Megaphone, Target, Layers, HelpCircle, Wifi } from 'lucide-react'

const token = () => localStorage.getItem('token')

const PERIODS = [
  { id:'today',      label:'Bu gün' },
  { id:'yesterday',  label:'Dünən' },
  { id:'last_7d',    label:'Son 7 gün' },
  { id:'last_30d',   label:'Son 30 gün' },
  { id:'this_month', label:'Bu ay' },
  { id:'last_month', label:'Keçən ay' },
]

const COLORS = ['#96bf48','#6c63ff','#00d4aa','#f59e0b','#f43f5e','#06b6d4','#a855f7','#10b981']

const StatusBadge = ({ s }) => {
  const map = { paid:{bg:'rgba(0,212,170,0.15)',c:'#00d4aa',label:'Ödənilib'}, pending:{bg:'rgba(245,158,11,0.15)',c:'#f59e0b',label:'Gözləyir'}, refunded:{bg:'rgba(244,63,94,0.15)',c:'#f43f5e',label:'Qaytarıldı'} }
  const m = map[s] || {bg:'rgba(255,255,255,0.07)',c:'#64748b',label:s||'—'}
  return <span style={{ fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:6,background:m.bg,color:m.c }}>{m.label}</span>
}

function CampaignCard({ c, currency, idx }) {
  const [open, setOpen] = useState(idx === 0)
  const sym = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.06 }}
      style={{ borderRadius:14, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', overflow:'hidden', marginBottom:10 }}>
      <button onClick={() => setOpen(o=>!o)}
        style={{ width:'100%', padding:'14px 20px', display:'flex', alignItems:'center', gap:14, background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${COLORS[idx%8]}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Megaphone size={16} color={COLORS[idx%8]} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#f0f0ff', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.campaign}</div>
          <div style={{ fontSize:12, color:'#64748b' }}>{c.count} sifariş · {sym}{c.revenue.toLocaleString('az-AZ',{maximumFractionDigits:2})}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:18, fontWeight:800, color: COLORS[idx%8] }}>{c.count}</div>
            <div style={{ fontSize:10, color:'#475569' }}>sifariş</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#00d4aa' }}>{sym}{c.revenue.toLocaleString('az-AZ',{maximumFractionDigits:2})}</div>
            <div style={{ fontSize:10, color:'#475569' }}>gəlir</div>
          </div>
          {open ? <ChevronDown size={16} color="#475569"/> : <ChevronRight size={16} color="#475569"/>}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
            style={{ overflow:'hidden', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ padding:'16px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Ad Set-lər */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#475569', marginBottom:10, textTransform:'uppercase', letterSpacing:0.8, display:'flex', alignItems:'center', gap:6 }}>
                  <Target size={11}/> Ad Set (utm_medium)
                </div>
                {c.ad_sets.length === 0 ? <div style={{ fontSize:12, color:'#334155' }}>Məlumat yoxdur</div> : (
                  c.ad_sets.slice(0,6).map((a,i) => (
                    <motion.div key={i} whileHover={{ x:3 }} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', borderRadius:8, marginBottom:4, background:'rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize:13, color:'#cbd5e1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'75%' }}>{a.name}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:COLORS[idx%8], flexShrink:0 }}>{a.count}</span>
                    </motion.div>
                  ))
                )}
              </div>
              {/* Ad-lar */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#475569', marginBottom:10, textTransform:'uppercase', letterSpacing:0.8, display:'flex', alignItems:'center', gap:6 }}>
                  <Layers size={11}/> Kreativ (utm_content)
                </div>
                {c.ads.length === 0 ? <div style={{ fontSize:12, color:'#334155' }}>Məlumat yoxdur</div> : (
                  c.ads.slice(0,6).map((a,i) => (
                    <motion.div key={i} whileHover={{ x:3 }} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', borderRadius:8, marginBottom:4, background:'rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize:13, color:'#cbd5e1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'75%' }}>{a.name}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:'#6c63ff', flexShrink:0 }}>{a.count}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ShopifyUTM() {
  const [period, setPeriod] = useState('last_30d')
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [tab, setTab]       = useState('campaigns')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API_BASE}/shopify/utm?period=${period}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const d = await r.json()
      if (!r.ok) { setError(d.detail || 'Xəta'); setData(null) }
      else setData(d)
    } catch { setError('Bağlantı xətası') }
    setLoading(false)
  }, [period])

  useEffect(() => { load() }, [load])

  const sym = data?.currency === 'EUR' ? '€' : data?.currency === 'USD' ? '$' : (data?.currency||'€')
  const total = data?.total_orders || 0
  const tracked = data?.utm_tracked || 0
  const fbcOnly = data?.fbc_only || 0
  const noTrack = data?.no_tracking || 0
  const trackPct = total > 0 ? Math.round(tracked/total*100) : 0

  return (
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#f59e0b,#d97706)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <TrendingUp size={22} color="#fff"/>
            </div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, color:'#f0f0ff' }}>UTM & Reklam İzləmə</h1>
              <p style={{ fontSize:13, color:'#64748b' }}>Shopify sifarişlərinin mənbə analizi</p>
            </div>
          </div>
          <button onClick={load} disabled={loading}
            style={{ padding:'8px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <RefreshCw size={14} style={{ animation: loading?'spin 1s linear infinite':'none' }}/>
            Yenilə
          </button>
        </div>

        {/* Period */}
        <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
          {PERIODS.map(p => (
            <motion.button key={p.id} onClick={() => setPeriod(p.id)}
              whileHover={{ scale:1.05, y:-2 }} whileTap={{ scale:0.96 }}
              style={{ padding:'8px 18px', borderRadius:20, border:'none', fontWeight:600, fontSize:13, cursor:'pointer',
                background: period===p.id ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.06)',
                color: period===p.id ? '#fff' : '#94a3b8',
                boxShadow: period===p.id ? '0 4px 16px rgba(245,158,11,0.3)' : 'none' }}>
              {p.label}
            </motion.button>
          ))}
        </div>

        {error && <div style={{ padding:'14px 18px', borderRadius:12, background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.2)', color:'#f43f5e', marginBottom:20, display:'flex', gap:10, alignItems:'center' }}>
          <AlertCircle size={16}/> {error}
        </div>}

        {loading && <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
          <div style={{ width:40, height:40, border:'3px solid rgba(245,158,11,0.2)', borderTopColor:'#f59e0b', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
        </div>}

        {data && !loading && (<>

          {/* İzləmə statistikası */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
            {[
              { icon:TrendingUp,  label:'Ümumi Sifariş',  value:total,    color:'#f59e0b', sub:'' },
              { icon:Megaphone,   label:'UTM İzlənən',    value:tracked,  color:'#96bf48', sub:`${trackPct}%` },
              { icon:Wifi,        label:'FBC (Reklam)',    value:fbcOnly,  color:'#6c63ff', sub:'UTM yox, fbc var' },
              { icon:HelpCircle,  label:'İzlənməyən',     value:noTrack,  color:'#64748b', sub:'Mənbəsiz' },
            ].map(({ icon:Icon, label, value, color, sub }) => (
              <motion.div key={label} whileHover={{ scale:1.04, y:-4 }} transition={{ type:'spring', stiffness:300, damping:20 }}
                style={{ padding:'20px 22px', borderRadius:16, background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.07)`, cursor:'default' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:`${color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={16} color={color}/>
                  </div>
                  <span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>{label}</span>
                </div>
                <div style={{ fontSize:26, fontWeight:800, color:'#f0f0ff' }}>{value}</div>
                {sub && <div style={{ fontSize:11, color, marginTop:4 }}>{sub}</div>}
              </motion.div>
            ))}
          </div>

          {/* İzləmə payı bar */}
          <div style={{ padding:'16px 20px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:13, color:'#94a3b8', fontWeight:600 }}>Sifariş İzləmə Bölgüsü</span>
              <span style={{ fontSize:12, color:'#64748b' }}>{total} sifariş</span>
            </div>
            <div style={{ display:'flex', height:12, borderRadius:8, overflow:'hidden', gap:2 }}>
              {[
                { w: tracked/total*100, color:'#96bf48', label:`UTM (${tracked})` },
                { w: fbcOnly/total*100, color:'#6c63ff', label:`FBC (${fbcOnly})` },
                { w: noTrack/total*100, color:'#1e293b', label:`İzlənməyən (${noTrack})` },
              ].map((s,i) => s.w > 0 && (
                <motion.div key={i} initial={{ width:0 }} animate={{ width:`${s.w}%` }} transition={{ duration:0.8, delay:i*0.1 }}
                  title={s.label}
                  style={{ height:'100%', background:s.color, borderRadius:4 }}/>
              ))}
            </div>
            <div style={{ display:'flex', gap:16, marginTop:10 }}>
              {[{c:'#96bf48',l:`UTM izlənən: ${tracked}`},{c:'#6c63ff',l:`Yalnız FBC: ${fbcOnly}`},{c:'#475569',l:`İzlənməyən: ${noTrack}`}].map((x,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#64748b' }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:x.c }}/>
                  {x.l}
                </div>
              ))}
            </div>
          </div>

          {/* Tab-lar */}
          <div style={{ display:'flex', gap:6, marginBottom:20 }}>
            {[
              { id:'campaigns', label:'Kampaniyalar' },
              { id:'sources',   label:'Mənbələr' },
              { id:'fbc',       label:`FBC (reklamdan, UTM yox) — ${fbcOnly}` },
              { id:'orders',    label:'Sifarişlər' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding:'8px 16px', borderRadius:20, border:'none', fontSize:13, fontWeight:600, cursor:'pointer',
                  background: tab===t.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                  color: tab===t.id ? '#f59e0b' : '#64748b',
                  borderBottom: tab===t.id ? '2px solid #f59e0b' : '2px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Kampaniyalar */}
          {tab === 'campaigns' && (
            <div>
              {data.campaigns.length === 0
                ? <div style={{ padding:40, textAlign:'center', color:'#334155' }}>UTM parametrli sifariş tapılmadı</div>
                : data.campaigns.map((c,i) => <CampaignCard key={c.campaign} c={c} currency={data.currency} idx={i}/>)
              }
            </div>
          )}

          {/* Mənbələr */}
          {tab === 'sources' && (
            <div style={{ padding:24, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#f0f0ff', marginBottom:18 }}>utm_source üzrə Sifarişlər</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.sources} margin={{ top:5, right:10, left:0, bottom:20 }}>
                  <XAxis dataKey="source" tick={{ fontSize:12, fill:'#64748b' }} angle={-20} textAnchor="end"/>
                  <YAxis tick={{ fontSize:11, fill:'#475569' }} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{ background:'#0a0a14', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:12 }}
                    formatter={v => [v + ' sifariş', 'Sifariş']}/>
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {data.sources.map((_,i) => <Cell key={i} fill={COLORS[i%8]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* FBC sifarişlər */}
          {tab === 'fbc' && (
            <div style={{ padding:20, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ marginBottom:14, padding:'10px 14px', borderRadius:10, background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.2)', fontSize:13, color:'#a78bfa' }}>
                ℹ️ Bu sifarişlər reklamdan gəlib (FBC cookie var) amma UTM parametrləri yoxdur. URL-ə UTM əlavə etməyi yoxlayın.
              </div>
              <OrderTable orders={data.unknown_fbc} sym={sym}/>
            </div>
          )}

          {/* Bütün sifarişlər */}
          {tab === 'orders' && (
            <div style={{ padding:20, borderRadius:16, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <OrderTable orders={data.orders} sym={sym} showUtm/>
            </div>
          )}

        </>)}
      </motion.div>
    </Layout>
  )
}

function OrderTable({ orders, sym, showUtm }) {
  if (!orders?.length) return <div style={{ padding:30, textAlign:'center', color:'#334155', fontSize:13 }}>Sifariş yoxdur</div>
  const cols = showUtm
    ? ['Müştəri','Ölkə','Məbləğ','Status','Kampaniya','Ad Set','Kreativ','Tarix']
    : ['Müştəri','Ölkə','Məbləğ','Status','Tarix']
  return (
    <div style={{ overflowX:'auto' }}>
      <div style={{ display:'grid', gridTemplateColumns: showUtm ? '1.5fr 0.6fr 0.8fr 0.8fr 1.5fr 1.5fr 1.5fr 0.8fr' : '2fr 0.6fr 1fr 1fr 1fr', minWidth: showUtm ? 900 : 500 }}>
        {cols.map(h => <div key={h} style={{ fontSize:10, fontWeight:700, color:'#475569', padding:'8px 10px', textTransform:'uppercase', letterSpacing:0.8 }}>{h}</div>)}
        {orders.map((o,i) => (
          <React.Fragment key={i}>
            <Cell2>{o.customer}</Cell2>
            <Cell2>{o.country||'—'}</Cell2>
            <Cell2 color="#96bf48">{sym}{(o.total||0).toFixed(2)}</Cell2>
            <Cell2><StatusBadge s={o.status}/></Cell2>
            {showUtm && <>
              <Cell2 color={o.utm_campaign?'#f59e0b':'#334155'}>{o.utm_campaign||'—'}</Cell2>
              <Cell2 color={o.utm_medium?'#6c63ff':'#334155'}>{o.utm_medium||'—'}</Cell2>
              <Cell2 color={o.utm_content?'#00d4aa':'#334155'}>{o.utm_content||'—'}</Cell2>
            </>}
            <Cell2 muted>{o.date}</Cell2>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function Cell2({ children, color, muted }) {
  return (
    <motion.div whileHover={{ background:'rgba(255,255,255,0.03)' }}
      style={{ fontSize:12, color: color||(muted?'#475569':'#cbd5e1'), padding:'9px 10px',
        borderTop:'1px solid rgba(255,255,255,0.04)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
      {children}
    </motion.div>
  )
}
