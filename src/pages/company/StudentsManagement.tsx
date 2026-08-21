import { useState } from 'react'
import { Check, Mail, Search, UserPlus, X } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Modal } from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Field'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { formatDateBR } from '../../lib/date'

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
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteProgram, setInviteProgram] = useState(programs[0]?.id ?? '')

  const companyRequests = requests
    .filter((r) => r.companyId === companyId)
    .map((r) => ({ ...r, student: students.find((s) => s.id === r.studentId) }))
    .filter((r) => r.student?.name.toLowerCase().includes(search.toLowerCase()) ?? true)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteProgram) return
    inviteStudentByEmail(companyId, inviteProgram, inviteName, inviteEmail)
    setInviteOpen(false)
    setInviteName('')
    setInviteEmail('')
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
          placeholder="Buscar aluno..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Aluno</th>
                <th className="px-5 py-3 font-semibold">Treinamento</th>
                <th className="px-5 py-3 font-semibold">Solicitado em</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companyRequests.map((req) => (
                <tr key={req.id}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={req.student?.name ?? '?'} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-800">{req.student?.name}</p>
                        <p className="text-xs text-slate-400">{req.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{programs.find((p) => p.id === req.programId)?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDateBR(req.requestedAt)}</td>
                  <td className="px-5 py-3.5">
                    <Badge status={req.status === 'ativo' ? 'ativo' : req.status === 'recusado' ? 'recusado' : 'pendente'} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {req.status === 'pendente' ? (
                        <>
                          <button
                            onClick={() => approveRequest(req.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            <Check size={13} /> Aprovar
                          </button>
                          <button
                            onClick={() => rejectRequest(req.id)}
                            className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
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

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Convidar aluno por e-mail"
        description="Um convite pendente será criado para este e-mail no treinamento selecionado."
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancelar
            </Button>
            <Button icon={<Mail size={15} />} onClick={handleInvite}>
              Enviar convite
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleInvite}>
          <Input label="Nome" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Nome do aluno" required />
          <Input label="E-mail" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="aluno@email.com" required />
          <Select label="Treinamento" value={inviteProgram} onChange={(e) => setInviteProgram(e.target.value)} required>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
