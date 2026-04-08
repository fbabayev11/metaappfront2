import { useState, useEffect } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function Settings() {
  const token = localStorage.getItem('token') || ''
  const user  = JSON.parse(localStorage.getItem('user') || '{}')
  const [fbToken,     setFbToken]     = useState('')
  const [fbAccount,   setFbAccount]   = useState('')
  const [openaiKey,   setOpenaiKey]   = useState('')
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [msg,         setMsg]         = useState('')
  const [showFb,      setShowFb]      = useState(false)
  const [showOAI,     setShowOAI]     = useState(false)

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${API}/auth/credentials`, { headers })
      .then(r => {
        setFbToken(r.data.fb_token || '')
        setFbAccount(r.data.fb_account_id || '')
        setOpenaiKey(r.data.openai_key || '')
      })
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true); setMsg('')
    try {
      await axios.put(`${API}/auth/credentials`, {
        fb_token: fbToken, fb_account_id: fbAccount, openai_key: openaiKey
      }, { headers })
      setMsg('✅ Yadda saxlandı!')
    } catch { setMsg('❌ Xəta baş verdi') }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading) return <div style={s.loading}>Yüklənir...</div>

  return (
    <div style={s.wrap}>
      <h2 style={s.title}>⚙️ Ayarlar</h2>
      <p style={s.sub}>Kredensiallarınız şifrəli saxlanılır və yalnız sizin hesabınıza aiddir.</p>

      {/* Facebook */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <div>
            <div style={s.cardTitle}>🔵 Facebook API</div>
            <div style={s.cardSub}>Reklamlarınızı analiz etmək üçün</div>
          </div>
          <div style={{...s.dot, background: fbToken ? '#4ade80' : '#f87171'}} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Access Token</label>
          <div style={s.inputWrap}>
            <input
              type={showFb ? 'text' : 'password'}
              value={fbToken}
              onChange={e => setFbToken(e.target.value)}
              placeholder="EAAxxxxxxxx..."
              style={s.input}
            />
            <button style={s.eye} onClick={() => setShowFb(x=>!x)}>{showFb?'🙈':'👁'}</button>
          </div>
          <div style={s.hint}>
            Meta Developer → Graph API Explorer → Generate Token<br/>
            İcazələr: <code style={s.code}>ads_read, ads_management, read_insights</code>
          </div>
        </div>
        <div style={s.field}>
          <label style={s.label}>Ad Account ID</label>
          <input
            type="text"
            value={fbAccount}
            onChange={e => setFbAccount(e.target.value)}
            placeholder="act_XXXXXXXXXX"
            style={s.input}
          />
          <div style={s.hint}>Meta Business Manager → Ad Accounts → ID</div>
        </div>
      </div>

      {/* OpenAI */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <div>
            <div style={s.cardTitle}>🤖 OpenAI API</div>
            <div style={s.cardSub}>AI analiz üçün (GPT-4)</div>
          </div>
          <div style={{...s.dot, background: openaiKey ? '#4ade80' : '#f87171'}} />
        </div>
        <div style={s.field}>
          <label style={s.label}>API Key</label>
          <div style={s.inputWrap}>
            <input
              type={showOAI ? 'text' : 'password'}
              value={openaiKey}
              onChange={e => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              style={s.input}
            />
            <button style={s.eye} onClick={() => setShowOAI(x=>!x)}>{showOAI?'🙈':'👁'}</button>
          </div>
          <div style={s.hint}>platform.openai.com → API Keys → Create new key</div>
        </div>
      </div>

      {msg && <div style={{...s.msg, color: msg.includes('✅') ? '#4ade80' : '#f87171'}}>{msg}</div>}

      <button style={s.btn} onClick={save} disabled={saving}>
        {saving ? 'Saxlanılır...' : '💾 Yadda Saxla'}
      </button>
    </div>
  )
}

const s = {
  wrap:     { maxWidth:600, margin:'0 auto', padding:24 },
  title:    { fontSize:22, fontWeight:800, marginBottom:6, color:'#f0f0f0' },
  sub:      { fontSize:13, color:'#666', marginBottom:24 },
  loading:  { textAlign:'center', padding:60, color:'#666' },
  card:     { background:'#1a1a1a', border:'1px solid #2e2e2e', borderRadius:14,
               padding:20, marginBottom:16 },
  cardHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  cardTitle:{ fontSize:15, fontWeight:700, color:'#f0f0f0' },
  cardSub:  { fontSize:12, color:'#666', marginTop:3 },
  dot:      { width:10, height:10, borderRadius:'50%' },
  field:    { marginBottom:14 },
  label:    { display:'block', fontSize:11, color:'#666', fontWeight:700,
               textTransform:'uppercase', letterSpacing:.5, marginBottom:6 },
  inputWrap:{ position:'relative' },
  input:    { width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid #2e2e2e',
               background:'#222', color:'#f0f0f0', fontSize:14, outline:'none',
               fontFamily:'monospace', boxSizing:'border-box' },
  eye:      { position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
               background:'none', border:'none', cursor:'pointer', fontSize:16 },
  hint:     { fontSize:11, color:'#555', marginTop:5, lineHeight:1.6 },
  code:     { color:'#f5a623', fontFamily:'monospace' },
  msg:      { textAlign:'center', padding:10, fontSize:14, marginBottom:12 },
  btn:      { width:'100%', padding:14, borderRadius:12, border:'none',
               background:'linear-gradient(135deg,#f5a623,#e8965a)', color:'#000',
               fontSize:15, fontWeight:700, cursor:'pointer' },
}
