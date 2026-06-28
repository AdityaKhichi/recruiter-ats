import React, { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const NavItem: React.FC<{ to: string; label: string; onClick?: () => void }> = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-2 rounded hover:bg-slate-100 text-slate-700"
  >
    {label}
  </Link>
)

const AuthLayout: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-white border-r transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-64'} md:static`}>
        <div className="h-full flex flex-col">
          <div className="px-4 py-5 flex items-center gap-3 border-b">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">R</div>
            <span className="font-semibold">Recruiter AI</span>
          </div>

          <nav className="p-4 space-y-1 flex-1">
            <NavItem to="/dashboard" label="Dashboard" onClick={() => setOpen(false)} />
            <NavItem to="/jobs" label="Jobs" onClick={() => setOpen(false)} />
            <NavItem to="/candidates" label="Candidates" onClick={() => setOpen(false)} />
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={() => logout()}
              className="w-full text-left px-4 py-2 rounded hover:bg-slate-100 text-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 md:ml-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen((s) => !s)}
                className="md:hidden p-2 rounded hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h1 className="text-lg font-semibold">App</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-slate-600">Welcome</div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AuthLayout
