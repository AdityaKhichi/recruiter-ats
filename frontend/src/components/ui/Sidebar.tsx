import React from 'react'
import { NavLink } from 'react-router-dom'
import { Briefcase, Home, LogOut, Users } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import Avatar from './Avatar'

const NavItem: React.FC<{ to: string; label: string; icon: React.ReactNode; onNavigate?: () => void }> = ({ to, label, icon, onNavigate }) => {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex h-12 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 ${isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`
      }
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

const Sidebar: React.FC<{ open?: boolean; className?: string; onNavigate?: () => void }> = ({ open = false, className = '', onNavigate }) => {
  const { logout, user } = useAuthContext()
  const userName = (user && (user.name || user.email)) ?? 'Recruiter'

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-[280px] transform border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} ${className}`.trim()}
      aria-label="Primary navigation"
    >
      <div className="flex h-full flex-col">
        <div>
          <div className="flex h-[72px] items-center gap-3 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-base font-semibold text-white">R</div>
            <div>
              <div className="text-base font-semibold text-slate-950">Recruiter AI</div>
              <div className="text-xs text-slate-500">Applicant tracking</div>
            </div>
          </div>

          <nav className="space-y-1 px-4 py-4">
            <NavItem to="/dashboard" label="Dashboard" icon={<Home size={18} />} onNavigate={onNavigate} />
            <NavItem to="/jobs" label="Jobs" icon={<Briefcase size={18} />} onNavigate={onNavigate} />
            <NavItem to="/candidates" label="Candidates" icon={<Users size={18} />} onNavigate={onNavigate} />
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-md px-2 py-2">
            <Avatar name={userName} />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-950">{userName}</div>
              <div className="text-xs text-slate-500">Recruiter profile</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex h-12 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
