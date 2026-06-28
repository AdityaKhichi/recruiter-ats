import apiClient from '../api/client'
import type { Candidate, CandidateCreateDto, CandidateUpdateDto } from '../types'

export async function listCandidates(): Promise<Candidate[]> {
  const res = await apiClient.get('/candidates')
  return res.data as Candidate[]
}

export async function getCandidate(id: string): Promise<Candidate> {
  const res = await apiClient.get(`/candidates/${id}`)
  return res.data as Candidate
}

export async function createCandidate(payload: CandidateCreateDto): Promise<Candidate> {
  const res = await apiClient.post('/candidates', payload)
  return res.data as Candidate
}

export async function updateCandidate(id: string, payload: CandidateUpdateDto): Promise<Candidate> {
  const res = await apiClient.put(`/candidates/${id}`, payload)
  return res.data as Candidate
}

export async function deleteCandidate(id: string): Promise<void> {
  await apiClient.delete(`/candidates/${id}`)
}
