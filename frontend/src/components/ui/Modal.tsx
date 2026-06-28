import React from 'react'

const Modal: React.FC<{ title: string; children: React.ReactNode; maxWidth?: string }> = ({ title, children, maxWidth = 'max-w-2xl' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className={`max-h-[calc(100vh-3rem)] w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-xl ${maxWidth}`}>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        {children}
      </div>
    </div>
  )
}

export default Modal
