import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Building2, Search, Star } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { useDataStore, useCurrentStudent } from '../../store/dataStore'
import { getVisibleCoursesForStudent, isStudentInProgram } from '../../lib/access'
import { CATEGORIES } from '../../mocks/courses'

export default function ExploreCourses() {
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const courses = useDataStore((s) => s.courses)
  const companies = useDataStore((s) => s.companies)
  const getCompanyById = (id?: string) => companies.find((c) => c.id === id)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Todas')

  const visibleCourses = useMemo(() => getVisibleCoursesForStudent(courses, student), [courses, student])

  const filtered = visibleCourses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'Todas' || c.category === category
    return matchSearch && matchCategory
  })

  const inProgram = isStudentInProgram(student)

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <PageHeader
        title="Explorar Cursos"
        description={
          inProgram
            ? 'Catálogo geral da SkillBridge + cursos exclusivos do seu treinamento corporativo.'
            : 'Catálogo geral da SkillBridge. Cursos exclusivos de empresas aparecem para alunos vinculados a um treinamento.'
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar curso..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['Todas', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                category === c ? 'bg-primary text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-primary-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => {
          const company = getCompanyById(course.companyId)
          return (
            <Link key={course.id} to={`/aluno/cursos/${course.id}`}>
              <Card hoverable padding="none" className="h-full overflow-hidden">
                <div className="relative">
                  <img src={course.coverUrl} alt={course.title} className="h-40 w-full object-cover" />
                  {company && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-primary-700 shadow-soft">
                      <Building2 size={12} /> Curso da {company.name}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-primary-500">{course.category}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Star size={12} className="text-cta" fill="currentColor" /> {course.rating || '—'}
                    </span>
                  </div>
                  <h3 className="mt-1.5 line-clamp-2 text-base font-bold text-slate-800">{course.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{course.summary}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen size={13} /> {course.totalHours}h · {course.modules.length} módulos
                    </span>
                    <span>{course.instructor}</span>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
          Nenhum curso encontrado com esses filtros.
        </div>
      )}
    </DashboardLayout>
  )
}
