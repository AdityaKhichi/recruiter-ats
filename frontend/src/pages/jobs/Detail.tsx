import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { getJob } from '../../services/job.service'
import { uploadCandidateResume } from '../../services/candidate.service'
import JobCandidatesPanel from '../../components/JobCandidatesPanel'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import SectionCard from '../../components/ui/SectionCard'

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJob(jobId!),
    enabled: !!jobId,
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCandidateResume(jobId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]) === 'jobCandidates' })
    },
  })

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading job...</div>
  if (isError) return <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">Error loading job: {(error as any)?.message}</div>
  if (!job) return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Job not found</div>

  const requirements = Array.isArray((job as any).requirements) ? (job as any).requirements : ((job as any).requirements ? String((job as any).requirements).split('\n') : [])

  return (
    <div className="space-y-8">
      <PageHeader
        title={job.title}
        subtitle="Job details, requirements, candidate pipeline, and resume intake."
        actions={<Button onClick={() => navigate('/jobs')} variant="outline"><ArrowLeft size={16} />Back to Jobs</Button>}
      />

      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Job Information</h3>
            <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm text-slate-600">{job.description ?? '-'}</p>
          </div>
          <Badge tone={String(job.status).toLowerCase() === 'open' ? 'green' : 'neutral'}>{job.status ?? '-'}</Badge>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-sm font-medium text-slate-700">Requirements</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {requirements.length === 0 ? <li>-</li> : requirements.map((requirement: any, index: number) => <li key={index} className="rounded-md bg-slate-50 px-3 py-2">{requirement}</li>)}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-700">Job ID</div>
            <div className="mt-1 text-sm text-slate-600">{job.id}</div>
            <div className="mt-4 text-sm font-medium text-slate-700">Created</div>
            <div className="mt-1 text-sm text-slate-600">{job.created_at ? new Date(job.created_at).toLocaleString() : '-'}</div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-950">Candidates</h3>
          <p className="mt-2 text-sm text-slate-500">Review candidates attached to this job and open candidate details for resume and fit analysis.</p>
        </div>
        <JobCandidatesPanel job={job} />
      </SectionCard>

      {/* <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Upload Resume</h3>
            <p className="mt-2 text-sm text-slate-500">Upload a PDF resume for backend extraction, parsing, and fit scoring.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                uploadMutation.mutate(file)
                event.target.value = ''
              }}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}><Upload size={16} />{uploadMutation.isPending ? 'Uploading...' : 'Upload Resume'}</Button>
          </div>
        </div>
        {uploadMutation.isError && <div className="mt-4 text-sm text-red-600">Upload failed</div>}
        {uploadMutation.isSuccess && <div className="mt-4 text-sm text-emerald-700">Resume uploaded. Candidate list refreshed.</div>}
      </SectionCard> */}
    </div>
  )
}

export default JobDetailPage
