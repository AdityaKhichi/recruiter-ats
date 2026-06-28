import apiClient from '../api/client'
import { Job, JobCreateDto, JobUpdateDto } from '../types'

export async function listJobs(): Promise<Job[]> {
  const res = await apiClient.get('/jobs')
  return res.data as Job[]
}

export async function getJob(id: string): Promise<Job> {
  const res = await apiClient.get(`/jobs/${id}`)
  return res.data as Job
}

export async function createJob(payload: JobCreateDto): Promise<Job> {
  const res = await apiClient.post('/jobs', payload)
  return res.data as Job
}

export async function updateJob(id: string, payload: JobUpdateDto): Promise<Job> {
  const res = await apiClient.put(`/jobs/${id}`, payload)
  return res.data as Job
}

export async function deleteJob(id: string): Promise<void> {
  await apiClient.delete(`/jobs/${id}`)
}
