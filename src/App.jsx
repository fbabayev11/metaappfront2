import React, { createContext, useContext, useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analyze from './pages/Analyze.jsx'
import ResultsCombined from './pages/ResultsCombined.jsx'
import Glossary from './pages/Glossary.jsx'
import FacebookAnalyze from './pages/FacebookAnalyze.jsx'
import Shopify from './pages/Shopify.jsx'
import ShopifyUTM from './pages/ShopifyUTM.jsx'
import Settings from './pages/Settings.jsx'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/analyze" element={<PrivateRoute><Analyze /></PrivateRoute>} />
          <Route path="/results-combined/:id" element={<PrivateRoute><ResultsCombined /></PrivateRoute>} />
          <Route path="/results-combined/:campaignId/:adsetId/:adId" element={<PrivateRoute><ResultsCombined /></PrivateRoute>} />
          <Route path="/shopify" element={<PrivateRoute><Shopify /></PrivateRoute>} />
          <Route path="/shopify-utm" element={<PrivateRoute><ShopifyUTM /></PrivateRoute>} />
          <Route path="/glossary" element={<PrivateRoute><Glossary /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/fb-analyze" element={<PrivateRoute><FacebookAnalyze /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
