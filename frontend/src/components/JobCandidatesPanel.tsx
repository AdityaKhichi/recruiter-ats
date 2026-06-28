import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Edit2, Plus, Search, Trash2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createJobCandidate, deleteJobCandidate, listJobCandidates, updateJobCandidate } from '../services/candidate.service'
import { toast } from './Toast'
import type { Job } from '../types'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Button from './ui/Button'
import FormField from './ui/FormField'
import Input from './ui/Input'
import Modal from './ui/Modal'
import { TableCard, TableScroll, tableClass, tdClass, thClass } from './ui/Table'

const candidateSchema = z.object({ full_name: z.string().min(1, 'Name is required'), email: z.string().email('Invalid email') })
type CandidateForm = z.infer<typeof candidateSchema>

const recommendationTone = (value?: string | null) => {
  const text = String(value ?? '').toLowerCase()
  if (text.includes('strong') || text.includes('high')) return 'green'
  if (text.includes('maybe') || text.includes('review') || text.includes('recommend')) return 'yellow'
  if (text.includes('no') || text.includes('low')) return 'red'
  return 'neutral'
}

const JobCandidatesPanel: React.FC<{ job: Job }> = ({ job }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [searchInput, setSearchInput] = React.useState('')
  const [searchFilter, setSearchFilter] = React.useState<string | null>(null)
  const [showCreate, setShowCreate] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)
  const [deleting, setDeleting] = React.useState<any | null>(null)

  const queryKey = ['jobCandidates', job.id, { page, limit, search: searchFilter }]
  const { data: candidates, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () => listJobCandidates(job.id, { page, limit, search: searchFilter }),
  })

  const createMutation = useMutation({
    mutationFn: (payload: any) => createJobCandidate(job.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]) === 'jobCandidates' })
      setShowCreate(false)
      toast('Candidate added', 'success')
    },
    onError: (err: any) => toast(err?.message ?? 'Failed to add candidate', 'error'),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: any }) => updateJobCandidate(job.id, id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]) === 'jobCandidates' })
      const previous = queryClient.getQueryData<any[]>(queryKey)
      if (previous) queryClient.setQueryData<any[]>(queryKey, previous.map((candidate) => (String(candidate.id) === String(id) ? { ...candidate, ...payload } : candidate)))
      return { previous }
    },
    onError: (err, _vars, context: any) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast((err as any)?.message ?? 'Failed to update candidate', 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]) === 'jobCandidates' })
      setEditing(null)
      toast('Candidate updated', 'success')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteJobCandidate(job.id, id),
    onMutate: async (id: number | string) => {
      await queryClient.cancelQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]) === 'jobCandidates' })
      const previous = queryClient.getQueryData<any[]>(queryKey)
      if (previous) queryClient.setQueryData<any[]>(queryKey, previous.filter((candidate) => String(candidate.id) !== String(id)))
      return { previous }
    },
    onError: (err, _id, context: any) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast((err as any)?.message ?? 'Failed to delete candidate', 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]) === 'jobCandidates' })
      setDeleting(null)
      toast('Candidate deleted', 'success')
    },
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CandidateForm>({ resolver: zodResolver(candidateSchema) })

  const onCreate = async (data: CandidateForm) => createMutation.mutateAsync({ full_name: data.full_name, email: data.email })
  const onEdit = async (data: CandidateForm) => {
    if (!editing) return
    await editMutation.mutateAsync({ id: editing.id, payload: { full_name: data.full_name, email: data.email } })
  }

  const openEdit = (candidate: any) => {
    reset({ full_name: candidate.parsed_resume?.full_name ?? candidate.full_name ?? candidate.name ?? '', email: candidate.parsed_resume?.email ?? candidate.email ?? '' })
    setEditing(candidate)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-medium text-slate-950">Candidate Count</div>
          <div className="mt-1 text-sm text-slate-500">{candidates?.length ?? 0} candidates on this page</div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search candidates" className="sm:w-72" />
          <Button onClick={() => { setSearchFilter(searchInput || null); setPage(1) }} variant="secondary"><Search size={16} />Search</Button>
          <Button onClick={() => { setSearchInput(''); setSearchFilter(null); setPage(1) }} variant="outline"><X size={16} />Clear</Button>
          <select value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }} className="h-12 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <Button onClick={() => { reset({ full_name: '', email: '' }); setShowCreate(true) }}><Plus size={16} />Add Candidate</Button>
        </div>
      </div>

      {isLoading && (
        <TableCard>
          <div className="space-y-3 p-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-12 animate-pulse rounded-md bg-slate-100" />)}</div>
        </TableCard>
      )}
      {isError && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">Error loading candidates: {(error as any)?.message}</div>}
      {!isLoading && !isError && (!candidates || candidates.length === 0) && <div className="rounded-md border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">No candidates found.</div>}

      {!isLoading && !isError && candidates && candidates.length > 0 && (
        <TableCard>
          <TableScroll>
            <table className={tableClass}>
              <thead className="bg-slate-50">
                <tr>
                  <th className={thClass}>Candidate</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Fit Score</th>
                  <th className={thClass}>Recommendation</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {candidates.map((candidate: any) => {
                  const name = candidate.parsed_resume?.full_name ?? candidate.full_name ?? candidate.name ?? 'Candidate'
                  const email = candidate.parsed_resume?.email ?? candidate.email ?? '-'
                  const fit = candidate.fit_analysis ?? null
                  return (
                    <tr key={candidate.id} className="h-[76px] hover:bg-slate-50">
                      <td className={tdClass}>
                        <button className="flex min-w-[220px] items-center gap-3 text-left" onClick={() => navigate(`/jobs/${job.id}/candidates/${candidate.id}`)}>
                          <Avatar name={name} />
                          <span className="font-medium text-slate-950 hover:text-blue-700">{name}</span>
                        </button>
                      </td>
                      <td className={tdClass}>{email}</td>
                      <td className={tdClass}><Badge tone="blue">{fit?.score ?? '-'}</Badge></td>
                      <td className={tdClass}><Badge tone={recommendationTone(fit?.recommendation) as any}>{fit?.recommendation ?? '-'}</Badge></td>
                      <td className={tdClass}><Badge tone={candidate.resume_filename ? 'green' : 'neutral'}>{candidate.resume_filename ? 'Resume uploaded' : 'Manual'}</Badge></td>
                      <td className={tdClass}>
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => openEdit(candidate)} variant="secondary" size="sm"><Edit2 size={15} />Edit</Button>
                          <Button onClick={() => setDeleting(candidate)} variant="danger" size="sm"><Trash2 size={15} />Delete</Button>
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
              <Button onClick={() => setPage((p) => p + 1)} variant="outline" size="sm" disabled={!(candidates.length === limit)}>Next</Button>
            </div>
          </div>
        </TableCard>
      )}

      {showCreate && (
        <Modal title="Add Candidate" maxWidth="max-w-md">
          <form onSubmit={handleSubmit(onCreate)} className="mt-6 space-y-6">
            <FormField label="Name" error={errors.full_name?.message}><Input {...register('full_name')} /></FormField>
            <FormField label="Email" error={errors.email?.message}><Input {...register('email')} /></FormField>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setShowCreate(false)} variant="outline">Cancel</Button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>{createMutation.isPending ? 'Adding...' : 'Add'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Candidate" maxWidth="max-w-md">
          <form onSubmit={handleSubmit(onEdit)} className="mt-6 space-y-6">
            <FormField label="Name" error={errors.full_name?.message}><Input {...register('full_name')} /></FormField>
            <FormField label="Email" error={errors.email?.message}><Input {...register('email')} /></FormField>
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={() => setEditing(null)} variant="outline">Cancel</Button>
              <Button type="submit" disabled={isSubmitting || editMutation.isPending}>{editMutation.isPending ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Candidate" maxWidth="max-w-md">
          <p className="mt-3 text-sm text-slate-600">Delete <strong>{deleting.parsed_resume?.full_name ?? deleting.full_name ?? deleting.name}</strong>?</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => setDeleting(null)} variant="outline">Cancel</Button>
            <Button onClick={() => deleteMutation.mutateAsync(deleting.id)} disabled={deleteMutation.isPending} variant="danger">{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default JobCandidatesPanel
