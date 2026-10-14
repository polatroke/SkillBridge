import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Award, GraduationCap, Printer } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { useAuthStore } from '../../store/authStore'
import { useCurrentStudent, useDataStore } from '../../store/dataStore'
import { formatDateBR } from '../../lib/date'

/**
 * Certificado de conclusão em página própria (sem sidebar), pensado para
 * imprimir / salvar como PDF pelo navegador. O documento fica sempre claro,
 * mesmo no tema escuro.
 */
export default function Certificate() {
  const { certificateId } = useParams()
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const certificate = useDataStore((s) => s.certificates.find((c) => c.id === certificateId))
  const course = useDataStore((s) => s.courses.find((c) => c.id === certificate?.courseId))
  const company = useDataStore((s) => s.companies.find((c) => c.id === course?.companyId))

  if (!student) return null

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0 dark:bg-slate-900">
      <style>{'@page { size: A4 landscape; margin: 0; }'}</style>

      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between gap-3 print:hidden">
        <Link to="/aluno/perfil">
          <Button variant="ghost" icon={<ArrowLeft size={16} />}>
            Meu perfil
          </Button>
        </Link>
        {certificate && course && (
          <Button icon={<Printer size={16} />} onClick={() => window.print()}>
            Imprimir / salvar PDF
          </Button>
        )}
      </div>

      {!certificate || !course || certificate.studentId !== student.id ? (
        <div className="mx-auto max-w-xl">
          <EmptyState title="Certificado não encontrado" description="Esse certificado não existe ou não pertence à sua conta." />
        </div>
      ) : (
        <div className="mx-auto max-w-4xl sm:aspect-[1.414] bg-white p-3 text-slate-900 shadow-card print:max-w-none print:shadow-none">
          <div className="flex h-full flex-col items-center justify-between gap-8 rounded-lg border-4 border-double border-primary-300 px-6 py-10 text-center sm:px-10">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <GraduationCap size={20} />
              </div>
              <span className="text-lg font-extrabold">SkillBridge</span>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-500">Certificado de conclusão</p>
              <p className="mt-6 text-sm text-slate-500">Certificamos que</p>
              <p className="mt-2 text-3xl font-extrabold sm:text-4xl">{student.name}</p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
                concluiu o curso <strong className="text-slate-900">{course.title}</strong>
                {company && <> do treinamento corporativo da {company.name}</>}, com carga horária de {course.totalHours} horas, ministrado por{' '}
                {course.instructor}.
              </p>
            </div>

            <div className="flex w-full flex-wrap items-end justify-between gap-6 text-left text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-700">Emitido em {formatDateBR(certificate.issuedAt)}</p>
                <p className="mt-0.5">Código: {certificate.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <Award size={44} className="text-amber-500" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
