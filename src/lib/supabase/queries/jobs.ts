import { supabase } from '../../supabaseClient'
import type { Job, JobApplication } from '../../../types'

interface JobRow {
  id: string
  company_id: string
  title: string
  description: string
  requirements: string[]
  department: string
  type: Job['type']
  mode: Job['mode']
  location: string | null
  status: Job['status']
  applications_count: number
  created_at: string
  job_programs?: { program_id: string }[]
}

function toJob(row: JobRow): Job {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    description: row.description,
    requirements: row.requirements ?? [],
    department: row.department,
    type: row.type,
    mode: row.mode,
    location: row.location ?? '',
    programIds: (row.job_programs ?? []).map((jp) => jp.program_id),
    status: row.status,
    applicationsCount: row.applications_count,
    createdAt: row.created_at.slice(0, 10),
  }
}

const SELECT = '*, job_programs(program_id)'

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase.from('jobs').select(SELECT)
  if (error) throw error
  return (data ?? []).map(toJob)
}

export async function insertJobRow(input: Omit<Job, 'id' | 'applicationsCount' | 'createdAt'>) {
  // Id gerado aqui e insert sem .select(): o RETURNING passaria pela política de leitura, cuja função
  // (fn_job_visible) consulta a própria tabela e ainda não enxerga a linha nova — o Postgres recusava o insert.
  const jobId = crypto.randomUUID()
  const { error } = await supabase
    .from('jobs')
    .insert({
      id: jobId,
      company_id: input.companyId,
      title: input.title,
      description: input.description,
      requirements: input.requirements,
      department: input.department,
      type: input.type,
      mode: input.mode,
      location: input.location,
      status: input.status,
    })
  if (error) throw error
  if (input.programIds.length) {
    const { error: jpErr } = await supabase.from('job_programs').insert(input.programIds.map((pid) => ({ job_id: jobId, program_id: pid })))
    if (jpErr) throw jpErr
  }
}

export async function updateJobRow(id: string, patch: Partial<Job>) {
  const fields: Record<string, unknown> = {}
  if (patch.title !== undefined) fields.title = patch.title
  if (patch.description !== undefined) fields.description = patch.description
  if (patch.requirements !== undefined) fields.requirements = patch.requirements
  if (patch.department !== undefined) fields.department = patch.department
  if (patch.type !== undefined) fields.type = patch.type
  if (patch.mode !== undefined) fields.mode = patch.mode
  if (patch.location !== undefined) fields.location = patch.location
  if (patch.status !== undefined) fields.status = patch.status
  if (Object.keys(fields).length) {
    const { error } = await supabase.from('jobs').update(fields).eq('id', id)
    if (error) throw error
  }
  if (patch.programIds) {
    const { error: delErr } = await supabase.from('job_programs').delete().eq('job_id', id)
    if (delErr) throw delErr
    if (patch.programIds.length) {
      const { error } = await supabase.from('job_programs').insert(patch.programIds.map((pid) => ({ job_id: id, program_id: pid })))
      if (error) throw error
    }
  }
}

export async function deleteJobRow(id: string) {
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  if (error) throw error
}

interface JobApplicationRow {
  id: string
  job_id: string
  student_id: string
  status: JobApplication['status']
  applied_at: string
}

export async function fetchJobApplications(): Promise<JobApplication[]> {
  const { data, error } = await supabase.from('job_applications').select('*')
  if (error) throw error
  return (data ?? []).map((row: JobApplicationRow) => ({
    id: row.id,
    jobId: row.job_id,
    studentId: row.student_id,
    status: row.status,
    appliedAt: row.applied_at.slice(0, 10),
  }))
}
