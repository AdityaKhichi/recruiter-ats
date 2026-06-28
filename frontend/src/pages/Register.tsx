import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import useAuth from '../hooks/useAuth'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import SectionCard from '../components/ui/SectionCard'

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
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormValues>({ resolver: zodResolver(schema) })

  React.useEffect(() => {
    if (isAuthenticated) window.location.replace('/dashboard')
  }, [isAuthenticated])

  const onSubmit = async (data: FormValues) => {
    try {
      await registerAction({ email: data.email, password: data.password })
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        for (const key in err.response.data.errors) setError(key as any, { type: 'server', message: err.response.data.errors[key] })
        return
      }
      setError('email', { type: 'manual', message: err?.message ?? 'Registration failed' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <div className="hidden border-r border-slate-200 bg-white px-12 lg:flex lg:flex-col lg:justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-lg font-semibold text-white">R</div>
        <h1 className="mt-8 max-w-lg text-4xl font-semibold tracking-normal text-slate-950">Recruiter AI</h1>
        <p className="mt-4 max-w-xl text-base text-slate-600">Create an account to manage roles, candidates, resume uploads, and AI fit analysis in one ATS workspace.</p>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <SectionCard className="w-full max-w-[420px]">
          <h1 className="text-2xl font-semibold text-slate-950">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">Set up your recruiting workspace.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField label="Email" error={errors.email?.message}><Input {...register('email')} /></FormField>
            <FormField label="Password" error={errors.password?.message}><Input type="password" {...register('password')} /></FormField>
            <FormField label="Confirm Password" error={errors.confirm?.message}><Input type="password" {...register('confirm')} /></FormField>
            <Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Register'}</Button>
            <Link to="/login" className="inline-flex h-12 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Login</Link>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}

export default Register
