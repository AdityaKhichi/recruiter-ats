import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const RootRedirect: React.FC = () => {
  const { loading, isAuthenticated } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-700">Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace={true} /> : <Navigate to="/login" replace={true} />
}

export default RootRedirect
