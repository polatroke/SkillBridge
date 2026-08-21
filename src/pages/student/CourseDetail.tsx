import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award, BookOpen, Building2, CheckCircle2, ChevronDown, Clock, Lock, PlayCircle, Star } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar } from '../../components/ui/Avatar'
import { useAuthStore } from '../../store/authStore'
import { useCurrentStudent, useDataStore } from '../../store/dataStore'
import { isStudentInProgram } from '../../lib/access'

export default function CourseDetail() {
  const { courseId } = useParams()
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const course = useDataStore((s) => s.courses.find((c) => c.id === courseId))
  const companies = useDataStore((s) => s.companies)
  const getCompanyById = (id?: string) => companies.find((c) => c.id === id)
  const [openModule, setOpenModule] = useState<string | null>(course?.modules[0]?.id ?? null)

  if (!course || !student) {
    return (
      <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
        <EmptyState title="Curso não encontrado" description="O curso que você tentou acessar não existe ou foi removido." />
      </DashboardLayout>
    )
  }

  const isCompanyCourse = !!course.companyId
  const hasAccess =
    !isCompanyCourse ||
    (isStudentInProgram(student) && student.companyId === course.companyId && course.programIds.includes(student.programId!))

  if (!hasAccess) {
    const company = getCompanyById(course.companyId)
    return (
      <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
        <EmptyState
          icon={Lock}
          title="Curso exclusivo de treinamento corporativo"
          description={`Este curso pertence ao treinamento de ${company?.name ?? 'uma empresa'} e só fica visível para alunos vinculados a esse programa.`}
          action={
            <Link to="/aluno/cursos">
              <Button variant="secondary" size="sm">
                Voltar para o catálogo
              </Button>
            </Link>
          }
        />
      </DashboardLayout>
    )
  }

  const company = getCompanyById(course.companyId)
  const isEnrolled = student.enrolledCourseIds.includes(course.id)
  const isCompleted = student.completedCourseIds.includes(course.id)

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link to="/aluno/cursos" className="hover:text-primary-600">
          Explorar Cursos
        </Link>
        <span>/</span>
        <span className="truncate text-slate-600">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <img src={course.coverUrl} alt={course.title} className="h-56 w-full rounded-2xl object-cover shadow-soft sm:h-72" />

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-600">{course.category}</span>
            {company && (
              <span className="flex items-center gap-1 rounded-full bg-cta-50 px-3 py-1 text-xs font-bold text-cta-700">
                <Building2 size={12} /> Curso da {company.name}
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={12} /> Concluído
              </span>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">{course.title}</h1>
          <p className="mt-3 text-slate-500">{course.summary}</p>

          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock size={15} /> {course.totalHours}h de conteúdo
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={15} /> {course.modules.length} módulos
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={15} className="text-cta" fill="currentColor" /> {course.rating || 'Sem avaliações'}
            </span>
          </div>

          <h2 className="mt-8 text-lg font-bold text-slate-900">Conteúdo do curso</h2>
          <div className="mt-3 space-y-3">
            {course.modules.map((mod, idx) => (
              <Card key={mod.id} padding="none" className="overflow-hidden">
                <button
                  onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{mod.title}</p>
                      <p className="text-xs text-slate-400">
                        {mod.lessons.length} aulas · {mod.duration}
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${openModule === mod.id ? 'rotate-180' : ''}`} />
                </button>
                {openModule === mod.id && (
                  <div className="border-t border-slate-100 px-5 py-3">
                    {mod.lessons.map((lesson) => (
                      <div key={lesson} className="flex items-center gap-2.5 py-2 text-sm text-slate-600">
                        <PlayCircle size={15} className="text-primary-400" /> {lesson}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            {isEnrolled ? (
              <>
                <p className="text-sm font-semibold text-slate-500">Seu progresso</p>
                <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-primary" style={{ width: isCompleted ? '100%' : '45%' }} />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">{isCompleted ? '100% concluído' : '45% concluído'}</p>
                <Button fullWidth className="mt-4">
                  {isCompleted ? 'Revisar curso' : 'Continuar curso'}
                </Button>
              </>
            ) : (
              <Button fullWidth>Matricular-se</Button>
            )}
          </Card>

          <Card>
            <p className="text-sm font-bold text-slate-800">Instrutor</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={course.instructor} />
              <div>
                <p className="text-sm font-semibold text-slate-800">{course.instructor}</p>
                <p className="text-xs text-slate-400">Instrutor(a) responsável</p>
              </div>
            </div>
          </Card>

          {isCompleted && (
            <Card className="bg-primary-50/60">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-600 shadow-soft">
                  <Award size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary-800">Certificado disponível</p>
                  <p className="text-xs text-primary-600">Você concluiu este curso</p>
                </div>
              </div>
              <Button variant="secondary" fullWidth size="sm" className="mt-4">
                Baixar certificado
              </Button>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
