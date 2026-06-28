import React from 'react'
import { useQuery } from '@tanstack/react-query'
import useAuth from '../hooks/useAuth'
import { listJobs } from '../services/job.service'
import { listJobCandidates } from '../services/candidate.service'
import type { Candidate, Job } from '../types'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import SectionCard from '../components/ui/SectionCard'

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <SectionCard className="flex h-[140px] flex-col justify-between">
    <div className="text-sm font-medium text-slate-500">{title}</div>
    <div className="text-3xl font-semibold text-slate-950">{value}</div>
  </SectionCard>
)

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  const { data: jobs, isLoading: jobsLoading, isError: jobsError } = useQuery<Job[]>({
    queryKey: ['dashboard', 'jobs'],
    queryFn: () => listJobs({ page: 1, limit: 1000 }),
  })

  const jobIds = React.useMemo(() => (jobs ?? []).map((j) => j.id), [jobs])

  const { data: candidates, isLoading: candsLoading, isError: candsError } = useQuery<Candidate[]>({
    queryKey: ['dashboard', 'candidates', jobIds],
    enabled: Array.isArray(jobIds) && jobIds.length > 0,
    queryFn: async () => {
      const jobsList = jobs ?? []
      const all: Candidate[] = []
      await Promise.all(
        jobsList.map(async (job) => {
          try {
            const items = await listJobCandidates(job.id, { page: 1, limit: 1000 })
            items.forEach((item) => all.push(item))
          } catch {
            // Keep dashboard totals resilient if one job's candidate fetch fails.
          }
        })
      )
      return all
    },
  })

  const loading = jobsLoading || candsLoading
  const averageFit = (() => {
    const scores = (candidates ?? []).map((c) => c.fit_analysis?.score).filter((score): score is number => typeof score === 'number')
    if (!scores.length) return '-'
    return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10
  })()

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle={user?.email ? `Overview for ${user.email}` : 'Hiring activity across jobs and candidates.'} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Jobs" value={loading ? '...' : (jobs ?? []).length} />
        <StatCard title="Open Jobs" value={loading ? '...' : (jobs ?? []).filter((j) => String(j.status).toLowerCase() === 'open').length} />
        <StatCard title="Total Candidates" value={loading ? '...' : (candidates ?? []).length} />
        <StatCard title="Average Fit Score" value={loading ? '...' : averageFit} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard>
          <h3 className="text-base font-semibold text-slate-950">Recent Jobs</h3>
          <div className="mt-4">
            {jobsError && <div className="text-sm text-red-600">Failed to load jobs</div>}
            {jobsLoading && <div className="text-sm text-slate-600">Loading...</div>}
            {!jobsLoading && !jobsError && (!jobs || jobs.length === 0) && <div className="text-sm text-slate-600">No jobs</div>}
            {!jobsLoading && jobs && jobs.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {[...jobs]
                  .sort((a, b) => (b.created_at ? new Date(b.created_at).getTime() : 0) - (a.created_at ? new Date(a.created_at).getTime() : 0))
                  .slice(0, 5)
                  .map((job) => (
                    <li key={job.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-950">{job.title}</div>
                        <div className="mt-1 text-xs text-slate-500">ID: {job.id}</div>
                      </div>
                      <Badge tone={String(job.status).toLowerCase() === 'open' ? 'green' : 'neutral'}>{job.status ?? '-'}</Badge>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <h3 className="text-base font-semibold text-slate-950">Recent Candidates</h3>
          <div className="mt-4">
            {candsError && <div className="text-sm text-red-600">Failed to load candidates</div>}
            {candsLoading && <div className="text-sm text-slate-600">Loading...</div>}
            {!candsLoading && !candsError && (!candidates || candidates.length === 0) && <div className="text-sm text-slate-600">No candidates</div>}
            {!candsLoading && candidates && candidates.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {[...candidates]
                  .sort((a, b) => (b.created_at ? new Date(b.created_at).getTime() : 0) - (a.created_at ? new Date(a.created_at).getTime() : 0))
                  .slice(0, 5)
                  .map((candidate) => (
                    <li key={candidate.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-950">{candidate.parsed_resume?.full_name ?? candidate.ai_summary ?? 'Candidate'}</div>
                        <div className="mt-1 truncate text-xs text-slate-500">Job ID: {candidate.job_id ?? '-'} - {candidate.parsed_resume?.email ?? '-'}</div>
                      </div>
                      <Badge tone="blue">{candidate.fit_analysis?.score ?? '-'} score</Badge>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

export default Dashboard
