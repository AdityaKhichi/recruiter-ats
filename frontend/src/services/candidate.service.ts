import apiClient from '../api/client'
import type { Candidate, CandidateCreateDto, CandidateUpdateDto } from '../types'

// Note: backend exposes job-scoped candidate endpoints only (no top-level /candidates).
export async function listJobCandidates(jobId: string | number, params?: { search?: string | null; page?: number; limit?: number }): Promise<Candidate[]> {
  const p: Record<string, any> = {}
  if (params) {
    if (params.search != null) p.search = params.search
    if (params.page != null) p.page = params.page
    if (params.limit != null) p.limit = params.limit
  }
  const res = await apiClient.get(`/api/v1/jobs/${jobId}/candidates`, { params: p })
  return res.data as Candidate[]
}

export async function getJobCandidate(jobId: string | number, candidateId: string | number): Promise<Candidate> {
  const res = await apiClient.get(`/api/v1/jobs/${jobId}/candidates/${candidateId}`)
  return res.data as Candidate
}

export async function createJobCandidate(jobId: string | number, payload: CandidateCreateDto | any): Promise<Candidate> {
  const res = await apiClient.post(`/api/v1/jobs/${jobId}/candidates`, payload)
  return res.data as Candidate
}

export async function updateJobCandidate(jobId: string | number, candidateId: string | number, payload: CandidateUpdateDto | any): Promise<Candidate> {
  const res = await apiClient.put(`/api/v1/jobs/${jobId}/candidates/${candidateId}`, payload)
  return res.data as Candidate
}

export async function deleteJobCandidate(jobId: string | number, candidateId: string | number): Promise<void> {
  await apiClient.delete(`/api/v1/jobs/${jobId}/candidates/${candidateId}`)
}

// Upload resume (multipart/form-data). Backend: POST /api/v1/jobs/{job_id}/candidates/upload
export async function uploadCandidateResume(jobId: string | number, file: File, candidateId?: number | null): Promise<{ filename: string; extracted_text: string; metadata: any | null }> {
  const fd = new FormData()
  fd.append('file', file)
  if (candidateId != null) fd.append('candidate_id', String(candidateId))
  // Let axios/browser set the correct multipart Content-Type (including boundary).
  const res = await apiClient.post(`/api/v1/jobs/${jobId}/candidates/upload`, fd)
  return res.data
}
