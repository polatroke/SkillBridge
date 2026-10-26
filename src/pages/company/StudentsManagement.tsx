import { useState } from 'react'
import { Check, Mail, Search, UserPlus, X } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input, Select } from '../../components/ui/Field'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { formatDateBR } from '../../lib/date'
import { friendlyError } from '../../lib/errors'
import type { EnrollmentRequest, Student } from '../../types'

/** Como a solicitação aparece hoje: uma aprovada cujo aluno já saiu do treinamento não está mais "ativa". */
function requestBadge(req: EnrollmentRequest, student?: Student) {
  if (req.status === 'pendente') return <Badge status="pendente" />
  if (req.status === 'recusado') return <Badge status="recusado" />
  return student?.programId === req.programId ? <Badge status="ativo" /> : <Badge status="neutral">Desvinculado</Badge>
}

export default function StudentsManagement() {
  const authUser = useAuthStore((s) => s.user)
  const companyId = authUser?.id ?? ''
  const students = useDataStore((s) => s.students)
  const requests = useDataStore((s) => s.enrollmentRequests)
  const allPrograms = useDataStore((s) => s.programs)
  const programs = allPrograms.filter((p) => p.companyId === companyId)
  const approveRequest = useDataStore((s) => s.approveRequest)
  const rejectRequest = useDataStore((s) => s.rejectRequest)
  const inviteStudentByEmail = useDataStore((s) => s.inviteStudentByEmail)

  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteProgram, setInviteProgram] = useState(programs[0]?.id ?? '')
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyRequest, setBusyRequest] = useState<string | null>(null)
  /** Aprovação que tiraria o aluno do treinamento de outra empresa: pede confirmação antes. */
  const [confirmMove, setConfirmMove] = useState<{ requestId: string; studentName: string } | null>(null)
  // Os treinamentos podem chegar depois do primeiro render (F5 direto nesta página): sem esse
  // fallback o estado ficava '' e "Vincular aluno" saía da função sem fazer nada.
  const selectedProgram = inviteProgram || programs[0]?.id || ''
  const term = search.trim().toLowerCase()
  const matches = (s?: Student) => !term || !!s?.name.toLowerCase().includes(term) || !!s?.email.toLowerCase().includes(term)
  const programName = (id?: string) => programs.find((p) => p.id === id)?.name ?? '—'

  const companyRequests = requests
    .filter((r) => r.companyId === companyId)
    .map((r) => ({ ...r, student: students.find((s) => s.id === r.studentId) }))
    .filter((r) => matches(r.student))
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))

  const enrolled = students.filter((s) => s.companyId === companyId && matches(s)).sort((a, b) => a.name.localeCompare(b.name))

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProgram) return
    setInviteError(null)
    setInviting(true)
    try {
      await inviteStudentByEmail(selectedProgram, inviteEmail.trim())
      setInviteOpen(false)
      setInviteEmail('')
    } catch (err) {
      // P0002 = a RPC não achou conta de aluno com esse e-mail; o resto (rede, permissão) era mostrado com a mesma frase.
      const code = (err as { code?: string } | null)?.code
      setInviteError(
        code === 'P0002'
          ? 'Não encontramos uma conta de aluno com esse e-mail. Peça para a pessoa se cadastrar em /cadastro antes de vincular ao treinamento.'
          : friendlyError(err, 'Não foi possível vincular o aluno. Tente novamente.')
      )
    } finally {
      setInviting(false)
    }
  }

  const decide = async (requestId: string, approve: boolean) => {
    setActionError(null)
    setBusyRequest(requestId)
    try {
      await (approve ? approveRequest(requestId) : rejectRequest(requestId))
    } catch (err) {
      setActionError(friendlyError(err, `Não foi possível ${approve ? 'aprovar' : 'recusar'} a solicitação. Tente novamente.`))
    } finally {
      setBusyRequest(null)
    }
  }

  const handleApprove = (req: (typeof companyRequests)[number]) => {
    const student = req.student
    // Um aluno participa de um treinamento por vez: aprovar aqui o tiraria do treinamento atual.
    if (student?.programId && student.programId !== req.programId) {
      setConfirmMove({ requestId: req.id, studentName: student.name })
      return
    }
    void decide(req.id, true)
  }

  return (
    <DashboardLayout sidebar={<CompanySidebar />} profileTitle="Painel da Empresa">
      <PageHeader
        title="Gestão de Alunos"
        description="Aprove ou recuse solicitações de acesso e convide novos alunos para seus treinamentos."
        actions={
          <Button icon={<UserPlus size={16} />} onClick={() => setInviteOpen(true)} disabled={programs.length === 0}>
            Convidar aluno
          </Button>
        }
      />

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar aluno por nome ou e-mail..."
          aria-label="Buscar aluno"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
        />
      </div>

      {actionError && <p className="mb-4 text-sm font-semibold text-red-600 dark:text-red-400">{actionError}</p>}

      <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-50">Solicitações</h2>
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Aluno</th>
                <th className="px-5 py-3 font-semibold">Treinamento</th>
                <th className="px-5 py-3 font-semibold">Solicitado em</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {companyRequests.map((req) => (
                <tr key={req.id}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={req.student?.name ?? '?'} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{req.student?.name ?? 'Aluno'}</p>
                        <p className="text-xs text-slate-400">{req.student?.email}</p>
                        {req.status === 'pendente' && req.student?.companyId && req.student.companyId !== companyId && (
                          <p className="mt-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">Já participa do treinamento de outra empresa</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{programName(req.programId)}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{formatDateBR(req.requestedAt)}</td>
                  <td className="px-5 py-3.5">{requestBadge(req, req.student)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {req.status === 'pendente' ? (
                        <>
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={busyRequest === req.id}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 disabled:opacity-50 dark:hover:bg-emerald-500/20"
                          >
                            <Check size={13} /> Aprovar
                          </button>
                          <button
                            onClick={() => void decide(req.id, false)}
                            disabled={busyRequest === req.id}
                            className="flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 disabled:opacity-50 dark:hover:bg-red-500/20"
                          >
                            <X size={13} /> Recusar
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {companyRequests.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-400">Nenhuma solicitação encontrada.</p>}
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Alunos nos seus treinamentos ({enrolled.length})</CardTitle>
          <p className="mt-1 text-xs text-slate-400">Inclui quem entrou por solicitação, por convite ou vinculado direto em Gestão de Treinamentos.</p>
        </CardHeader>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {enrolled.map((s) => {
            const program = programs.find((p) => p.id === s.programId)
            const done = program ? program.courseIds.filter((id) => s.completedCourseIds.includes(id)).length : 0
            return (
              <div key={s.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={s.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
                    <p className="truncate text-xs text-slate-400">{s.email}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-full bg-primary-50 px-2 py-0.5 font-semibold text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                    {program?.name ?? 'Treinamento'}
                  </span>
                  <span>
                    {done} de {program?.courseIds.length ?? 0} curso(s) concluído(s)
                  </span>
                </div>
              </div>
            )
          })}
          {enrolled.length === 0 && <p className="py-6 text-center text-sm text-slate-400">Nenhum aluno vinculado aos seus treinamentos ainda.</p>}
        </div>
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => !inviting && setInviteOpen(false)}
        title="Vincular aluno por e-mail"
        description="A pessoa precisa já ter uma conta de aluno na SkillBridge — o vínculo é criado direto, sem convite pendente. Se ela estiver em outro treinamento, passa para este."
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviteOpen(false)} disabled={inviting}>
              Cancelar
            </Button>
            <Button type="submit" form="invite-student-form" icon={<Mail size={15} />} disabled={inviting}>
              {inviting ? 'Vinculando...' : 'Vincular aluno'}
            </Button>
          </>
        }
      >
        <form id="invite-student-form" className="space-y-4" onSubmit={handleInvite}>
          <Input label="E-mail do aluno" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="aluno@email.com" required />
          <Select label="Treinamento" value={selectedProgram} onChange={(e) => setInviteProgram(e.target.value)} required>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          {inviteError && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{inviteError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmMove}
        onClose={() => setConfirmMove(null)}
        onConfirm={async () => {
          if (!confirmMove) return
          await approveRequest(confirmMove.requestId)
        }}
        title={`Aprovar ${confirmMove?.studentName ?? 'aluno'}?`}
        description="Esse aluno já participa de outro treinamento. Cada aluno fica em um treinamento por vez: ao aprovar, ele sai do treinamento atual e perde o acesso aos cursos, mentores e vagas de lá."
        confirmLabel="Aprovar mesmo assim"
      />
    </DashboardLayout>
  )
}
