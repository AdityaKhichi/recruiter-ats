import React from 'react'
import { Routes, Route } from 'react-router-dom'
import RootRedirect from '../pages/RootRedirect'
import NotFound from '../pages/NotFound'
import Login from '../pages/Login'
import ProtectedRoute from '../components/ProtectedRoute'
import AuthLayout from '../layouts/AuthLayout'
import Dashboard from '../pages/Dashboard'
import JobsPage from '../pages/jobs'
import CandidatesPage from '../pages/candidates'
import CandidateDetail from '../pages/candidates/Detail'
import JobDetailPage from '../pages/jobs/Detail'
import Register from '../pages/Register'

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/jobs/:jobId/candidates/:candidateId" element={<CandidateDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
