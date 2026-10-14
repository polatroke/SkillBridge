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

export async function completeLesson(courseId: string, moduleIndex: number, lessonIndex: number) {
  const { data, error } = await supabase.rpc('complete_lesson', {
    p_course_id: courseId,
    p_module_index: moduleIndex,
    p_lesson_index: lessonIndex,
  })
  if (error) throw error
  return data as { done: number; total: number; course_completed: boolean }
}

export async function submitActivity(activityId: string, answer: string, url?: string) {
  const { data, error } = await supabase.rpc('submit_activity', { p_activity_id: activityId, p_answer: answer, p_url: url ?? null })
  if (error) throw error
  return data
}

export async function cancelMentorSession(sessionId: string) {
  const { data, error } = await supabase.rpc('cancel_mentor_session', { p_session_id: sessionId })
  if (error) throw error
  return data
}

export async function reviewMentorSession(sessionId: string, rating: number, review: string) {
  const { data, error } = await supabase.rpc('review_mentor_session', { p_session_id: sessionId, p_rating: rating, p_review: review })
  if (error) throw error
  return data
}
