import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tracker from './pages/Tracker'
import Finder from './pages/Finder'
import Letters from './pages/Letters'
import Outreach from './pages/Outreach'
import Suggestions from './pages/Suggestions'
import Goals from './pages/Goals'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/"            element={<Dashboard />} />
              <Route path="/tracker"     element={<Tracker />} />
              <Route path="/finder"      element={<Finder />} />
              <Route path="/letters"     element={<Letters />} />
              <Route path="/outreach"    element={<Outreach />} />
              <Route path="/suggestions" element={<Suggestions />} />
              <Route path="/goals"       element={<Goals />} />
              <Route path="/profile"     element={<Profile />} />
              <Route path="/settings"    element={<Settings />} />
              <Route path="*"            element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
