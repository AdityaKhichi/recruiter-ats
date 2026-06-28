import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Edit2, Eye, Plus, Search, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createJob, deleteJob, listJobs, updateJob } from '../../services/job.service'
import { toast } from '../../components/Toast'
import type { Job } from '../../types'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'
import SectionCard from '../../components/ui/SectionCard'
import { TableCard, TableScroll, tableClass, tdClass, thClass } from '../../components/ui/Table'
import Textarea from '../../components/ui/Textarea'

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().optional(),
})

type FormValues = z.infer<typeof jobSchema>

const statusTone = (status?: string | null) => {
  const value = String(status ?? '').toLowerCase()
  if (value === 'open') return 'green'
  if (value === 'draft') return 'yellow'
  if (value === 'closed') return 'red'
  return 'neutral'
}

const JobsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = React.useState<string | null>(null)
  const [searchInput, setSearchInput] = React.useState('')
  const [searchFilter, setSearchFilter] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [showCreate, setShowCreate] = React.useState(false)
  const [editingJob, setEditingJob] = React.useState<Job | null>(null)
  const [deletingJob, setDeletingJob] = React.useState<Job | null>(null)

  const queryKey = ['jobs', { status: statusFilter, search: searchFilter, page, limit }]
  const { data: jobs, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => listJobs({ status: statusFilter, search: searchFilter, page, limit }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'jobs' })
      setShowCreate(false)
      toast('Job created', 'success')
    },
    onError: (err: any) => toast(err?.message ?? 'Failed to create job', 'error'),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateJob(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'jobs' })
      const previous = queryClient.getQueryData<Job[]>(queryKey)
      if (previous) queryClient.setQueryData<Job[]>(queryKey, previous.map((job) => (String(job.id) === String(id) ? ({ ...job, ...payload } as Job) : job)))
      return { previous }
    },
    onError: (err, _vars, context: any) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast((err as any)?.message ?? 'Failed to update job', 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'jobs' })
      setEditingJob(null)
      toast('Job updated', 'success')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'jobs' })
      const previous = queryClient.getQueryData<Job[]>(queryKey)
      if (previous) queryClient.setQueryData<Job[]>(queryKey, previous.filter((job) => String(job.id) !== String(id)))
      return { previous }
    },
    onError: (err, _id, context: any) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast((err as any)?.message ?? 'Failed to delete job', 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'jobs' })
      setDeletingJob(null)
      toast('Job deleted', 'success')
    },
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(jobSchema) })

  const openCreate = () => {
    reset({ title: '', description: '', requirements: '' })
    setShowCreate(true)
  }

  const openEdit = (job: Job) => {
    const reqs = (job as any).requirements
    reset({ title: job.title ?? '', description: (job as any).description ?? '', requirements: Array.isArray(reqs) ? reqs.join('\n') : reqs ?? '' })
    setEditingJob(job)
  }

  const buildPayload = (data: FormValues) => ({
    title: data.title,
    description: data.description,
    requirements: data.requirements ? data.requirements.split('\n').map((item) => item.trim()).filter(Boolean) : [],
  })

  const onSubmitCreate = async (data: FormValues) => createMutation.mutateAsync(buildPayload(data))
  const onSubmitEdit = async (data: FormValues) => {
    if (!editingJob) return
    await editMutation.mutateAsync({ id: String(editingJob.id), payload: buildPayload(data) })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Jobs"
        subtitle="Manage roles, requirements, and candidate pipelines."
        actions={<Button onClick={openCreate}><Plus size={16} />Create Job</Button>}
      />

      <SectionCard>
        <div className="grid gap-4 lg:grid-cols-[180px_1fr_140px]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Status</span>
            <select value={statusFilter ?? ''} onChange={(e) => { setStatusFilter(e.target.value || null); setPage(1) }} className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100">
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Search</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search title or description" />
              <Button onClick={() => { setSearchFilter(searchInput || null); setPage(1) }} variant="secondary"><Search size={16} />Search</Button>
              <Button onClick={() => { setSearchInput(''); setSearchFilter(null); setPage(1) }} variant="outline"><X size={16} />Clear</Button>
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Per page</span>
            <select value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-100">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
        </div>
      </SectionCard>

      {isLoading && (
        <TableCard>
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-12 animate-pulse rounded-md bg-slate-100" />)}
          </div>
        </TableCard>
      )}

      {isError && (
        <SectionCard className="border-red-200 bg-red-50">
          <div className="font-medium text-red-700">Unable to load jobs</div>
          <div className="mt-1 text-sm text-red-600">{(error as any)?.message ?? 'An unexpected error occurred.'}</div>
          <Button onClick={() => refetch()} variant="danger" className="mt-4">Retry</Button>
        </SectionCard>
      )}

      {!isLoading && !isError && (!jobs || jobs.length === 0) && (
        <SectionCard className="text-center">
          <div className="font-medium text-slate-950">No jobs found</div>
          <div className="mt-2 text-sm text-slate-500">Create a role to start collecting candidates.</div>
          <Button onClick={openCreate} className="mt-4"><Plus size={16} />Create Job</Button>
        </SectionCard>
      )}

      {!isLoading && !isError && jobs && jobs.length > 0 && (
        <TableCard>
          <TableScroll>
            <table className={tableClass}>
              <thead className="bg-slate-50">
                <tr>
                  <th className={thClass}>Title</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Created</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {jobs.map((job: any) => {
                  const created = job.createdAt ?? job.created_at
                  return (
                    <tr key={job.id} className="h-[72px] hover:bg-slate-50">
                      <td className={`${tdClass} min-w-[260px]`}>
                        <button className="font-medium text-slate-950 hover:text-blue-700" onClick={() => navigate(`/jobs/${job.id}`)}>{job.title}</button>
                      </td>
                      <td className={tdClass}><Badge tone={statusTone(job.status) as any}>{job.status ?? '-'}</Badge></td>
                      <td className={`${tdClass} whitespace-nowrap`}>{created ? new Date(created).toLocaleString() : '-'}</td>
                      <td className={tdClass}>
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => navigate(`/jobs/${job.id}`)} variant="outline" size="sm"><Eye size={15} />View</Button>
                          <Button onClick={() => openEdit(job)} variant="secondary" size="sm"><Edit2 size={15} />Edit</Button>
                          <Button onClick={() => setDeletingJob(job)} variant="danger" size="sm"><Trash2 size={15} />Delete</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableScroll>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <div className="text-sm text-slate-600">Page {page}</div>
            <div className="flex gap-2">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} variant="outline" size="sm" disabled={page <= 1}>Prev</Button>
              <Button onClick={() => setPage((p) => p + 1)} variant="outline" size="sm" disabled={!(jobs.length === limit)}>Next</Button>
            </div>
          </div>
        </TableCard>
      )}

      {showCreate && (
        <Modal title="Create Job">
          <form onSubmit={handleSubmit(onSubmitCreate)} className="mt-6 max-w-[640px] space-y-6">
            <FormField label="Title" error={errors.title?.message}><Input {...register('title')} /></FormField>
            <FormField label="Description" error={errors.description?.message}><Textarea rows={5} {...register('description')} /></FormField>
            <FormField label="Requirements (one per line)"><Textarea rows={4} {...register('requirements')} /></FormField>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setShowCreate(false)} variant="outline">Cancel</Button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {editingJob && (
        <Modal title="Edit Job">
          <form onSubmit={handleSubmit(onSubmitEdit)} className="mt-6 max-w-[640px] space-y-6">
            <FormField label="Title" error={errors.title?.message}><Input {...register('title')} /></FormField>
            <FormField label="Description" error={errors.description?.message}><Textarea rows={5} {...register('description')} /></FormField>
            <FormField label="Requirements (one per line)"><Textarea rows={4} {...register('requirements')} /></FormField>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setEditingJob(null)} variant="outline">Cancel</Button>
              <Button type="submit" disabled={isSubmitting || editMutation.isPending}>{editMutation.isPending ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {deletingJob && (
        <Modal title="Delete Job" maxWidth="max-w-md">
          <p className="mt-3 text-sm text-slate-600">Delete <strong>{deletingJob.title}</strong>? This action cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => setDeletingJob(null)} variant="outline">Cancel</Button>
            <Button onClick={() => deleteMutation.mutateAsync(String(deletingJob.id))} disabled={deleteMutation.isPending} variant="danger">{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default JobsPage
