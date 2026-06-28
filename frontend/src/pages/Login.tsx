import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import useAuth from '../hooks/useAuth'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const auth = useAuth()

  React.useEffect(() => {
    if (auth.isAuthenticated) {
      // if already authenticated, redirect to dashboard
      window.location.replace('/dashboard')
    }
  }, [auth.isAuthenticated])

  const onSubmit = async (data: FormValues) => {
    try {
      await auth.login(data)
    } catch (err: any) {
      const message = err?.message ?? 'Login failed'
      // set a form-level error
      setError('email', { type: 'manual', message })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input className="w-full border rounded px-3 py-2" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" {...register('password')} />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
