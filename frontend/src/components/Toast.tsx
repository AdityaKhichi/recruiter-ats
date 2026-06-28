import React, { useEffect, useState } from 'react'

type ToastItem = { id: string; message: string; type?: 'success' | 'error' | 'info' }

export function toast(message: string, type: ToastItem['type'] = 'info') {
  try {
    window.dispatchEvent(new CustomEvent('recruiter-toast', { detail: { message, type } }))
  } catch (e) {
    // ignore
  }
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (e: any) => {
      const { message, type } = e.detail || {}
      const id = String(Date.now()) + Math.random().toString(16).slice(2, 8)
      const item: ToastItem = { id, message, type }
      setToasts((t) => [item, ...t])
      // auto remove
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id))
      }, 4500)
    }
    window.addEventListener('recruiter-toast', handler as any)
    return () => window.removeEventListener('recruiter-toast', handler as any)
  }, [])

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col-reverse gap-2 max-w-xs">
        {toasts.map((t) => (
          <div key={t.id} className={`p-3 rounded shadow text-sm text-white ${t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-slate-700'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}

export default ToastProvider
