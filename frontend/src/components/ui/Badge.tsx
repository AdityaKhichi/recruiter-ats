import React from 'react'

export const Badge: React.FC<{ children?: React.ReactNode; tone?: 'neutral' | 'green' | 'yellow' | 'red' | 'blue' }> = ({ children, tone = 'neutral' }) => {
  const cls = {
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  }[tone]

  return <span className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium ring-1 ring-inset ${cls}`}>{children}</span>
}

export default Badge
