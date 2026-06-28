import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import useAuth from '../hooks/useAuth'
import { toast } from '../components/Toast'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import SectionCard from '../components/ui/SectionCard'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const auth = useAuth()

  React.useEffect(() => {
    if (auth.isAuthenticated) window.location.replace('/dashboard')
  }, [auth.isAuthenticated])

  const onSubmit = async (data: FormValues) => {
    try {
      await auth.login(data)
      toast('Signed in successfully', 'success')
    } catch (err: any) {
      const message = err?.message ?? 'Login failed'
      setError('email', { type: 'manual', message })
      toast(message, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <div className="hidden border-r border-slate-200 bg-white px-12 lg:flex lg:flex-col lg:justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-lg font-semibold text-white">R</div>
        <h1 className="mt-8 max-w-lg text-4xl font-semibold tracking-normal text-slate-950">Recruiter AI</h1>
        <p className="mt-4 max-w-xl text-base text-slate-600">A focused AI recruiter and applicant tracking workspace for jobs, candidates, resume parsing, and fit scoring.</p>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <SectionCard className="w-full max-w-[420px]">
          <h1 className="text-2xl font-semibold text-slate-950">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Access your recruiting workspace.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField label="Email" error={errors.email?.message}><Input {...register('email')} /></FormField>
            <FormField label="Password" error={errors.password?.message}><Input type="password" {...register('password')} /></FormField>
            <Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Login'}</Button>
            <Link to="/register" className="inline-flex h-12 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Register</Link>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}

export default Login
