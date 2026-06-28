// Application-wide API types

// Auth
export type AuthLoginParams = {
  email: string
  password: string
}

export type AuthLoginResponse = {
  token: string
  user?: any
}

// Job
export type Job = {
  id: string
  title: string
  description?: string
  location?: string
  createdAt?: string
  updatedAt?: string
}

export type JobCreateDto = {
  title: string
  description?: string
  location?: string
}

export type JobUpdateDto = Partial<JobCreateDto>

// Candidate
export type Candidate = {
  id: string
  name: string
  email?: string
  phone?: string
  resumeUrl?: string
  createdAt?: string
}

export type CandidateCreateDto = {
  name: string
  email?: string
  phone?: string
}

export type CandidateUpdateDto = Partial<CandidateCreateDto>
