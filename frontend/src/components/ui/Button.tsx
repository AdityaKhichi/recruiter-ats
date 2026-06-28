import React from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success'
type Size = 'sm' | 'md' | 'icon'

const base = 'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-12 px-4 text-sm',
  icon: 'h-10 w-10 text-sm',
}

const variants: Record<Variant, string> = {
  primary: 'bg-slate-950 text-white hover:bg-slate-800 focus:ring-slate-400',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
  ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400',
}

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; fullWidth?: boolean }> = ({ variant = 'primary', size = 'md', className = '', children, fullWidth = false, ...rest }) => {
  return (
    <button {...rest} className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`.trim()}>
      {children}
    </button>
  )
}

export default Button
