import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'

// Auth
import Login from './pages/auth/Login'

// Employee
import EmployeeDashboard  from './pages/employee/Dashboard'
import MyGoals            from './pages/employee/MyGoals'
import QuarterlyUpdate    from './pages/employee/QuarterlyUpdate'
import EmployeeAI         from './pages/employee/AIAssistant'

// Manager
import TeamDashboard    from './pages/manager/TeamDashboard'
import Approvals        from './pages/manager/Approvals'
import CheckIn          from './pages/manager/CheckIn'
import EmployeeDetail   from './pages/manager/EmployeeDetail'
import ManagerAI        from './pages/manager/AIInsights'

// Admin
import AdminDashboard   from './pages/admin/AdminDashboard'
import UserManagement   from './pages/admin/UserManagement'
import SharedGoals      from './pages/admin/SharedGoals'
import Reports          from './pages/admin/Reports'
import AuditLogs        from './pages/admin/AuditLogs'

function AppRoutes() {
  const { token, fetchMe, user } = useAuthStore()

  // Restore session on hard refresh
  useEffect(() => {
    if (token && !user) fetchMe()
  }, [])

  return (
    <Routes>
      {/* Public */}
      <Route path="auth/login" element={<Login />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      {/* ── Employee routes ── */}
      <Route path="/employee/dashboard" element={
        <ProtectedRoute roles={['employee']}>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/employee/goals" element={
        <ProtectedRoute roles={['employee']}>
          <MyGoals />
        </ProtectedRoute>
      } />
      <Route path="/employee/quarterly" element={
        <ProtectedRoute roles={['employee']}>
          <QuarterlyUpdate />
        </ProtectedRoute>
      } />
      <Route path="/employee/ai" element={
        <ProtectedRoute roles={['employee']}>
          <EmployeeAI />
        </ProtectedRoute>
      } />

      {/* ── Manager routes ── */}
      <Route path="/manager/dashboard" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <TeamDashboard />
        </ProtectedRoute>
      } />
      <Route path="/manager/approvals" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <Approvals />
        </ProtectedRoute>
      } />
      <Route path="/manager/checkin" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <CheckIn />
        </ProtectedRoute>
      } />
      <Route path="/manager/employee/:id" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <EmployeeDetail />
        </ProtectedRoute>
      } />
      <Route path="/manager/ai" element={
        <ProtectedRoute roles={['manager', 'admin']}>
          <ManagerAI />
        </ProtectedRoute>
      } />

      {/* ── Admin routes ── */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/shared-goals" element={
        <ProtectedRoute roles={['admin']}>
          <SharedGoals />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['admin']}>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/admin/audit" element={
        <ProtectedRoute roles={['admin']}>
          <AuditLogs />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
