import apiClient from '../api/client'
import type { Job, JobCreateDto, JobUpdateDto } from '../types';

export async function listJobs(params?: { status?: string | null; search?: string | null; page?: number; limit?: number }): Promise<Job[]> {
  const p: Record<string, any> = {}
  if (params) {
    if (params.status != null) p.status = params.status
    if (params.search != null) p.search = params.search
    if (params.page != null) p.page = params.page
    if (params.limit != null) p.limit = params.limit
  }
  const res = await apiClient.get('/api/v1/jobs', { params: p })
  return res.data as Job[]
}

export async function getJob(id: string): Promise<Job> {
  const res = await apiClient.get(`/api/v1/jobs/${id}`)
  return res.data as Job
}

export async function createJob(payload: JobCreateDto): Promise<Job> {
  const res = await apiClient.post('/api/v1/jobs', payload)
  return res.data as Job
}

export async function updateJob(id: string, payload: JobUpdateDto): Promise<Job> {
  const res = await apiClient.put(`/api/v1/jobs/${id}`, payload)
  return res.data as Job
}

export async function deleteJob(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/jobs/${id}`)
}
