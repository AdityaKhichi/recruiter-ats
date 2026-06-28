import React from 'react'
import { Menu, LogOut } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import Avatar from './Avatar'
import Button from './Button'

const titles: Array<[RegExp, string]> = [
  [/^\/dashboard$/, 'Dashboard'],
  [/^\/jobs$/, 'Jobs'],
  [/^\/jobs\/[^/]+\/candidates\/[^/]+$/, 'Candidate Details'],
  [/^\/jobs\/[^/]+$/, 'Job Details'],
  [/^\/candidates$/, 'Candidates'],
]

const Header: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const { user, logout } = useAuthContext()
  const location = useLocation()
  const title = titles.find(([pattern]) => pattern.test(location.pathname))?.[1] ?? 'Recruiter AI'
  const userName = (user && (user.name || user.email)) ?? 'Recruiter'

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <h2 className="truncate text-lg font-semibold text-slate-950">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <Avatar name={userName} />
            <div className="max-w-[220px] truncate text-sm font-medium text-slate-700">{userName}</div>
          </div>
          <Button onClick={() => logout()} variant="ghost" size="sm">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
