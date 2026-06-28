import React from 'react'

const Avatar: React.FC<{ name?: string | null; className?: string }> = ({ name, className = '' }) => {
  const label = (name || 'Recruiter').trim()
  const initial = label.charAt(0).toUpperCase() || 'R'

  return (
    <div className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white ${className}`.trim()}>
      {initial}
    </div>
  )
}

export default Avatar
