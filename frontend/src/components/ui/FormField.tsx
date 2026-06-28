import React from 'react'

const FormField: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-600">{error}</span>}
    </label>
  )
}

export default FormField
