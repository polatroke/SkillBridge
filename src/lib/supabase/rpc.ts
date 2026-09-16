import { supabase } from '../supabaseClient'

export async function enrollInCourse(courseId: string) {
  const { data, error } = await supabase.rpc('enroll_in_course', { p_course_id: courseId })
  if (error) throw error
  return data
}

export async function applyToJob(jobId: string) {
  const { data, error } = await supabase.rpc('apply_to_job', { p_job_id: jobId })
  if (error) throw error
  return data
}

export async function bookMentorSession(availabilityId: string, date: string, topic: string) {
  const { data, error } = await supabase.rpc('book_mentor_session', { p_availability_id: availabilityId, p_date: date, p_topic: topic })
  if (error) throw error
  return data
}

export async function inviteExistingStudent(programId: string, email: string) {
  const { data, error } = await supabase.rpc('invite_existing_student', { p_program_id: programId, p_email: email })
  if (error) throw error
  return data
}
