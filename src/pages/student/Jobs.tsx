import { useMemo, useState } from 'react'
import { Briefcase, Building2, Lock, MapPin, Send } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StudentSidebar } from '../../components/layout/StudentSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { useAuthStore } from '../../store/authStore'
import { useDataStore, useCurrentStudent } from '../../store/dataStore'
import { getVisibleJobsForStudent, isStudentInProgram } from '../../lib/access'
import type { Job } from '../../types'

export default function StudentJobs() {
  const authUser = useAuthStore((s) => s.user)
  const student = useCurrentStudent(authUser?.id)
  const jobs = useDataStore((s) => s.jobs)
  const companies = useDataStore((s) => s.companies)
  const getCompanyById = (id?: string) => companies.find((c) => c.id === id)
  const [applied, setApplied] = useState<Job | null>(null)

  const visibleJobs = useMemo(() => getVisibleJobsForStudent(jobs, student), [jobs, student])
  const inProgram = isStudentInProgram(student)

  if (!student) return null

  return (
    <DashboardLayout sidebar={<StudentSidebar />} profileTitle="Painel do Aluno">
      <PageHeader
        title="Vagas"
        description="Vagas internas exclusivas de empresas parceiras — não existe uma vitrine pública de vagas na SkillBridge."
      />

      {!inProgram ? (
        <EmptyState
          icon={Lock}
          title="Vagas disponíveis apenas dentro de um treinamento"
          description="A SkillBridge não tem uma seção pública de vagas. Elas só aparecem para alunos participando de um treinamento (programa) oferecido por uma empresa parceira. Explore o catálogo de cursos e candidate-se a um treinamento para desbloquear vagas internas."
        />
      ) : visibleJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nenhuma vaga disponível no momento"
          description="A empresa do seu treinamento ainda não publicou vagas internas. Volte em breve."
        />
      ) : (
        <div className="space-y-4">
          {visibleJobs.map((job) => {
            const company = getCompanyById(job.companyId)
            return (
              <Card key={job.id} hoverable>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-cta-50 px-2.5 py-1 text-xs font-bold text-cta-700">
                        <Building2 size={12} /> {company?.name}
                      </span>
                      <Badge status={job.status === 'aberta' ? 'aberta' : 'encerrada'} />
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{job.type}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-slate-800">{job.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{job.description}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} /> {job.location} · {job.mode}
                      </span>
                      <span>{job.department}</span>
                    </div>
                    <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-slate-500">
                      {job.requirements.slice(0, 3).map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    disabled={job.status !== 'aberta'}
                    icon={<Send size={14} />}
                    onClick={() => setApplied(job)}
                  >
                    Candidatar-se
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={!!applied}
        onClose={() => setApplied(null)}
        title="Candidatura enviada!"
        footer={<Button onClick={() => setApplied(null)}>Fechar</Button>}
      >
        <p className="text-sm text-slate-600">
          Sua candidatura para <strong>{applied?.title}</strong> foi enviada para a equipe de recrutamento. Boa sorte!
        </p>
      </Modal>
    </DashboardLayout>
  )
}
