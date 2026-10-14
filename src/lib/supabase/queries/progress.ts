import { supabase } from '../../supabaseClient'
import type { LessonProgress } from '../../../types'

interface LessonProgressRow {
  student_id: string
  course_id: string
  module_index: number
  lesson_index: number
}

export async function fetchLessonProgress(): Promise<LessonProgress[]> {
  const { data, error } = await supabase.from('lesson_progress').select('student_id, course_id, module_index, lesson_index')
  if (error) throw error
  return (data ?? []).map((row: LessonProgressRow) => ({
    studentId: row.student_id,
    courseId: row.course_id,
    moduleIndex: row.module_index,
    lessonIndex: row.lesson_index,
  }))
}
