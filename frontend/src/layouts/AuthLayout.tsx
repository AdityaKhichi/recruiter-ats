import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/ui/Header'
import Sidebar from '../components/ui/Sidebar'

const AuthLayout: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {open && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <Sidebar open={open} onNavigate={() => setOpen(false)} />

      <div className="min-h-screen lg:ml-[280px]">
        <Header onMenuClick={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AuthLayout
