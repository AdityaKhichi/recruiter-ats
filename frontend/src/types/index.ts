// Application-wide API types

// Auth
export type AuthLoginParams = {
  email: string
  password: string
}

// Backend token response
export type TokenResponse = {
  access_token: string
  token_type?: string
}

export type RegisterResponse = {
  id: number
  email: string
  full_name?: string | null
}

// Job (align with backend JobResponse)
export type Job = {
  id: number | string
  title: string
  description?: string | null
  requirements?: string[]
  status?: string
  recruiter_id?: number
  created_at?: string
  updated_at?: string
}

export type JobCreateDto = {
  title: string
  description?: string | null
  requirements?: string[]
  status?: string
}

export type JobUpdateDto = Partial<JobCreateDto>

// Candidate (align with backend CandidateResponse)
export type ParsedResume = {
  full_name?: string | null
  email?: string | null
  phone?: string | null
  location?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
  summary?: string | null
  education?: Array<Record<string, any>>
  skills?: string[]
  certifications?: string[]
  projects?: Array<Record<string, any>>
  experience?: Array<Record<string, any>>
  total_experience_years?: number
  current_company?: string | null
  current_designation?: string | null
}

export type FitAnalysis = {
  score: number
  summary?: string | null
  strengths: string[]
  gaps: string[]
  recommendation: string
}

export type Candidate = {
  id: number | string
  parsed_resume?: ParsedResume | null
  fit_analysis?: FitAnalysis | null
  resume_filename?: string | null
  resume_text?: string | null
  resume_pages?: number | null
  resume_filesize?: number | null
  resume_uploaded_at?: string | null
  ai_summary?: string | null
  job_id?: number
  recruiter_id?: number
  created_at?: string
  updated_at?: string
}

export type CandidateCreateDto = {
  full_name: string
  email?: string
  phone?: string
  resume_filename?: string | null
  resume_text?: string | null
  ai_summary?: string | null
}

export type CandidateUpdateDto = Partial<CandidateCreateDto>
