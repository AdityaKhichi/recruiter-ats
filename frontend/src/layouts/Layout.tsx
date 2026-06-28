import React from 'react'
import { Outlet, Link } from 'react-router-dom'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">R</div>
            <span className="font-semibold text-lg">Recruiter AI</span>
          </Link>
          <nav>
            {/* Placeholder nav - add links when ready */}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t mt-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-slate-500">© {new Date().getFullYear()} Recruiter AI</div>
      </footer>
    </div>
  )
}

export default Layout
