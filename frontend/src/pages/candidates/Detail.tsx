import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { getJobCandidate, uploadCandidateResume } from '../../services/candidate.service'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import SectionCard from '../../components/ui/SectionCard'

const RecommendationBadge: React.FC<{ rec?: string | null }> = ({ rec }) => {
  if (!rec) return <Badge>-</Badge>
  const text = String(rec)
  const lower = text.toLowerCase()
  const tone = lower.includes('strong') || lower.includes('high') ? 'green' : lower.includes('recommend') || lower.includes('review') ? 'yellow' : lower.includes('low') || lower.includes('no') ? 'red' : 'neutral'
  return <Badge tone={tone as any}>{text}</Badge>
}

const ListBlock: React.FC<{ title: string; items?: any[]; empty: string; render?: (item: any, index: number) => React.ReactNode }> = ({ title, items = [], empty, render }) => (
  <div>
    <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
    {items.length === 0 ? (
      <div className="mt-2 text-sm text-slate-500">{empty}</div>
    ) : (
      <div className="mt-3 space-y-3">{items.map((item, index) => <div key={index}>{render ? render(item, index) : <div className="text-sm text-slate-700">{String(item)}</div>}</div>)}</div>
    )}
  </div>
)

const CandidateDetail: React.FC = () => {
  const { jobId, candidateId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const { data: cand, isLoading, isError, error } = useQuery({
    queryKey: ['jobCandidate', jobId, candidateId],
    queryFn: () => getJobCandidate(jobId!, candidateId!),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCandidateResume(jobId!, file, Number(candidateId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]) === 'jobCandidate' })
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]) === 'jobCandidates' })
    },
    onError: (err: any) => {
      console.error('Upload failed', err)
    },
  })

  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading candidate...</div>
  if (isError) return <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">Error loading candidate: {(error as any)?.message}</div>
  if (!cand) return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Candidate not found</div>

  const anyCandidate = cand as any
  const parsed = anyCandidate.parsed_resume ?? null
  const fit = anyCandidate.fit_analysis ?? null
  const name = parsed?.full_name ?? anyCandidate.full_name ?? 'Candidate'
  const email = parsed?.email ?? anyCandidate.email ?? '-'
  const score = typeof fit?.score === 'number' ? Math.max(0, Math.min(100, fit.score)) : 0

  return (
    <div className="space-y-8">
      <PageHeader
        title={name}
        subtitle={email}
        actions={<Button onClick={() => navigate(-1)} variant="outline"><ArrowLeft size={16} />Back</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-start gap-4">
              <Avatar name={name} className="h-12 w-12" />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-950">Candidate Information</h3>
                <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <div><span className="font-medium text-slate-700">Name:</span> {name}</div>
                  <div><span className="font-medium text-slate-700">Email:</span> {email}</div>
                  <div><span className="font-medium text-slate-700">Phone:</span> {parsed?.phone ?? anyCandidate.phone ?? '-'}</div>
                  <div><span className="font-medium text-slate-700">Location:</span> {parsed?.location ?? '-'}</div>
                  <div><span className="font-medium text-slate-700">Current role:</span> {parsed?.current_designation ?? '-'}</div>
                  <div><span className="font-medium text-slate-700">Current company:</span> {parsed?.current_company ?? '-'}</div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="text-base font-semibold text-slate-950">Parsed Resume</h3>
            <div className="mt-6 space-y-8">
              <div>
                <h4 className="text-sm font-semibold text-slate-950">Summary</h4>
                <p className="mt-2 text-sm text-slate-600">{parsed?.summary ?? anyCandidate.ai_summary ?? '-'}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-950">Skills</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(parsed?.skills ?? []).length === 0 ? <div className="text-sm text-slate-500">No skills listed</div> : parsed.skills.map((skill: string, index: number) => <Badge key={index} tone="blue">{skill}</Badge>)}
                </div>
              </div>

              <ListBlock
                title="Experience"
                items={parsed?.experience ?? []}
                empty="No experience entries"
                render={(experience) => (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-sm font-medium text-slate-950">{experience.title ?? experience.position ?? 'Role'}</div>
                    <div className="mt-1 text-xs text-slate-500">{[experience.company, experience.start_date, experience.end_date].filter(Boolean).join(' - ')}</div>
                    {experience.description && <div className="mt-2 text-sm text-slate-600">{experience.description}</div>}
                  </div>
                )}
              />

              <ListBlock
                title="Education"
                items={parsed?.education ?? []}
                empty="No education entries"
                render={(education) => (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-sm font-medium text-slate-950">{education.degree ?? education.title ?? 'Education'}</div>
                    <div className="mt-1 text-xs text-slate-500">{[education.institution, education.start_date, education.end_date].filter(Boolean).join(' - ')}</div>
                  </div>
                )}
              />

              <ListBlock
                title="Projects"
                items={parsed?.projects ?? []}
                empty="No projects"
                render={(project) => (
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-sm font-medium text-slate-950">{project.name ?? project.title ?? 'Project'}</div>
                    {project.summary && <div className="mt-2 text-sm text-slate-600">{project.summary}</div>}
                  </div>
                )}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <h3 className="text-base font-semibold text-slate-950">Resume</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div><span className="font-medium text-slate-700">File:</span> {anyCandidate.resume_filename ?? '-'}</div>
              <div><span className="font-medium text-slate-700">Pages:</span> {anyCandidate.resume_pages ?? '-'}</div>
              <div><span className="font-medium text-slate-700">Uploaded:</span> {anyCandidate.resume_uploaded_at ? new Date(anyCandidate.resume_uploaded_at).toLocaleString() : '-'}</div>
            </div>
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
              disabled={uploadMutation.isPending}
            />
            <Button onClick={() => fileInputRef.current?.click()} className="mt-5 w-full" disabled={uploadMutation.isPending}><Upload size={16} />{uploadMutation.isPending ? 'Uploading...' : 'Upload Resume'}</Button>
            {uploadMutation.isError && <div className="mt-3 text-sm text-red-600">Upload failed</div>}
            {uploadMutation.isSuccess && <div className="mt-3 text-sm text-emerald-700">Uploaded</div>}
          </SectionCard>

          <SectionCard>
            <h3 className="text-base font-semibold text-slate-950">Fit Analysis</h3>
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Score</span>
                <span className="font-semibold text-slate-950">{fit?.score ?? '-'}</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-950" style={{ width: `${score}%` }} />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Recommendation</span>
              <RecommendationBadge rec={fit?.recommendation} />
            </div>
            <p className="mt-5 text-sm text-slate-600">{fit?.summary ?? '-'}</p>
          </SectionCard>

          <SectionCard>
            <ListBlock title="Strengths" items={fit?.strengths ?? []} empty="No strengths listed" render={(item) => <div className="text-sm text-slate-700">- {item}</div>} />
            <div className="mt-6">
              <ListBlock title="Gaps" items={fit?.gaps ?? []} empty="No gaps listed" render={(item) => <div className="text-sm text-slate-700">- {item}</div>} />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

export default CandidateDetail
