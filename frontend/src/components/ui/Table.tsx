import React from 'react'

export const TableCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${className}`.trim()}>{children}</div>
}

export const TableScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="overflow-x-auto">{children}</div>
}

export const tableClass = 'min-w-full divide-y divide-slate-200'
export const thClass = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-normal text-slate-500'
export const tdClass = 'px-4 py-4 text-sm text-slate-700'

