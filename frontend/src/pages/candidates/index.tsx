import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { listJobCandidates } from '../../services/candidate.service'
import { listJobs } from '../../services/job.service'
import type { Candidate, Job } from '../../types'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'
import SectionCard from '../../components/ui/SectionCard'
import { TableCard, TableScroll, tableClass, tdClass, thClass } from '../../components/ui/Table'

type CandidateWithJob = Candidate & { job?: Job }

const CandidatesPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = React.useState('')
  const [searchFilter, setSearchFilter] = React.useState<string | null>(null)

  const { data: jobs, isLoading: jobsLoading, isError: jobsError } = useQuery<Job[]>({
    queryKey: ['candidates', 'jobs'],
    queryFn: () => listJobs({ page: 1, limit: 1000 }),
  })

  const jobIds = React.useMemo(() => (jobs ?? []).map((job) => job.id), [jobs])

  const { data: candidates, isLoading: candidatesLoading, isError: candidatesError } = useQuery<CandidateWithJob[]>({
    queryKey: ['candidates', 'global', jobIds, searchFilter],
    enabled: !!jobs && jobs.length > 0,
    queryFn: async () => {
      const all: CandidateWithJob[] = []
      await Promise.all(
        (jobs ?? []).map(async (job) => {
          const items = await listJobCandidates(job.id, { page: 1, limit: 1000, search: searchFilter })
          items.forEach((candidate) => all.push({ ...candidate, job }))
        })
      )
      return all
    },
  })

  const isLoading = jobsLoading || candidatesLoading
  const isError = jobsError || candidatesError

  return (
    <div className="space-y-8">
      <PageHeader title="Candidates" subtitle="Search candidates across all jobs. Candidate management remains job-scoped." />

      <SectionCard>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name, email, or resume content" />
          <Button onClick={() => setSearchFilter(searchInput || null)} variant="secondary"><Search size={16} />Search</Button>
          <Button onClick={() => { setSearchInput(''); setSearchFilter(null) }} variant="outline"><X size={16} />Clear</Button>
        </div>
      </SectionCard>

      {isLoading && (
        <TableCard>
          <div className="space-y-3 p-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-12 animate-pulse rounded-md bg-slate-100" />)}</div>
        </TableCard>
      )}

      {isError && <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">Unable to load candidates.</div>}
      {!isLoading && !isError && (!candidates || candidates.length === 0) && <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">No candidates found.</div>}

      {!isLoading && !isError && candidates && candidates.length > 0 && (
        <TableCard>
          <TableScroll>
            <table className={tableClass}>
              <thead className="bg-slate-50">
                <tr>
                  <th className={thClass}>Candidate</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Job</th>
                  <th className={thClass}>Fit Score</th>
                  <th className={thClass}>Recommendation</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {candidates.map((candidate) => {
                  const anyCandidate = candidate as any
                  const name = candidate.parsed_resume?.full_name ?? anyCandidate.full_name ?? anyCandidate.name ?? 'Candidate'
                  const email = candidate.parsed_resume?.email ?? anyCandidate.email ?? '-'
                  return (
                    <tr key={`${candidate.job?.id}-${candidate.id}`} className="h-[76px] hover:bg-slate-50">
                      <td className={tdClass}>
                        <div className="flex min-w-[220px] items-center gap-3">
                          <Avatar name={name} />
                          <span className="font-medium text-slate-950">{name}</span>
                        </div>
                      </td>
                      <td className={tdClass}>{email}</td>
                      <td className={tdClass}>{candidate.job?.title ?? candidate.job_id ?? '-'}</td>
                      <td className={tdClass}><Badge tone="blue">{candidate.fit_analysis?.score ?? '-'}</Badge></td>
                      <td className={tdClass}><Badge>{candidate.fit_analysis?.recommendation ?? '-'}</Badge></td>
                      <td className={tdClass}>
                        <div className="flex justify-end">
                          <Button onClick={() => navigate(`/jobs/${candidate.job?.id ?? candidate.job_id}/candidates/${candidate.id}`)} variant="outline" size="sm">View Details</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableScroll>
        </TableCard>
      )}
    </div>
  )
}

export default CandidatesPage
