import React from 'react'

const SectionCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...rest }) => {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm ${className}`.trim()} {...rest}>
      {children}
    </div>
  )
}

export default SectionCard
