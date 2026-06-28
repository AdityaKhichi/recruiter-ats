import React from 'react'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-slate-700">404</h1>
        <p className="mt-4 text-slate-600">Page not found.</p>
        <Link to="/" className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded">Go Home</Link>
      </div>
    </div>
  )
}

export default NotFound
