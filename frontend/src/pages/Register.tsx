import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import useAuth from '../hooks/useAuth'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm: z.string().min(1),
}).refine((data) => data.password === data.confirm, {
  path: ['confirm'],
  message: 'Passwords must match',
})

type FormValues = z.infer<typeof schema>

const Register: React.FC = () => {
  const { register: registerAction, isAuthenticated } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  React.useEffect(() => {
    if (isAuthenticated) {
      // redirect handled by AuthProvider on mount; but guard here too
      window.location.replace('/dashboard')
    }
  }, [isAuthenticated])

  const onSubmit = async (data: FormValues) => {
    try {
      await registerAction({ email: data.email, password: data.password })
    } catch (err: any) {
      // If server returns validation errors, surface them
      if (err?.response?.data) {
        const body = err.response.data
        // Attempt to map known validation shape
        if (body.errors) {
          for (const key in body.errors) {
            setError(key as any, { type: 'server', message: body.errors[key] })
          }
          return
        }
      }
      setError('email', { type: 'manual', message: err?.message ?? 'Registration failed' })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Register</h1>
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
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input type="password" className="w-full border rounded px-3 py-2" {...register('confirm')} />
            {errors.confirm && <p className="text-sm text-red-600 mt-1">{errors.confirm.message}</p>}
          </div>

          <div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded">
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
