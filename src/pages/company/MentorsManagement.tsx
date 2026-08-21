import { useState } from 'react'
import { Mail, RefreshCcw, Search, Trash2, UserPlus } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input, Textarea } from '../../components/ui/Field'
import { MultiSelect } from '../../components/ui/MultiSelect'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { formatDateBR } from '../../lib/date'

type FormMode = 'invite' | 'direct' | null

export default function MentorsManagement() {
  const authUser = useAuthStore((s) => s.user)
  const companyId = authUser?.id ?? ''
  const mentors = useDataStore((s) => s.mentors)
  const invites = useDataStore((s) => s.mentorInvites)
  const allPrograms = useDataStore((s) => s.programs)
  const programs = allPrograms.filter((p) => p.companyId === companyId)
  const inviteMentorByEmail = useDataStore((s) => s.inviteMentorByEmail)
  const addMentorDirect = useDataStore((s) => s.addMentorDirect)
  const removeMentor = useDataStore((s) => s.removeMentor)
  const removeMentorInvite = useDataStore((s) => s.removeMentorInvite)
  const resendMentorInvite = useDataStore((s) => s.resendMentorInvite)

  const [search, setSearch] = useState('')
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [toRemove, setToRemove] = useState<{ type: 'mentor' | 'invite'; id: string; name: string } | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [skills, setSkills] = useState('')
  const [bio, setBio] = useState('')
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])

  const companyMentors = mentors.filter((m) => m.companyId === companyId)
  const companyInvites = invites.filter((i) => i.companyId === companyId)

  const filteredMentors = companyMentors.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
  const filteredInvites = companyInvites.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))

  const resetForm = () => {
    setName('')
    setEmail('')
    setSkills('')
    setBio('')
    setSelectedPrograms([])
    setFormMode(null)
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    inviteMentorByEmail(companyId, name, email)
    resetForm()
  }

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addMentorDirect({
      name,
      email,
      bio: bio || 'Mentor(a) cadastrado(a) diretamente pela empresa.',
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      pricePerSession: 0,
      companyId,
      programIds: selectedPrograms,
    })
    resetForm()
  }

  return (
    <DashboardLayout sidebar={<CompanySidebar />} profileTitle="Painel da Empresa">
      <PageHeader
        title="Gestão de Mentores"
        description="Convide mentores por e-mail ou cadastre diretamente. Mentores só aparecem para alunos dos treinamentos vinculados."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Mail size={16} />} onClick={() => setFormMode('invite')}>
              Convidar por e-mail
            </Button>
            <Button icon={<UserPlus size={16} />} onClick={() => setFormMode('direct')}>
              Cadastrar mentor
            </Button>
          </div>
        }
      />

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar mentor..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Mentor</th>
                <th className="px-5 py-3 font-semibold">Especialidades</th>
                <th className="px-5 py-3 font-semibold">Treinamentos</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMentors.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{m.skills.slice(0, 3).join(', ') || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {programs
                        .filter((p) => m.programIds.includes(p.id))
                        .map((p) => (
                          <span key={p.id} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-600">
                            {p.name}
                          </span>
                        ))}
                      {m.programIds.length === 0 && <span className="text-xs text-slate-400">Nenhum</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status="ativo" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setToRemove({ type: 'mentor', id: m.id, name: m.name })}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={13} /> Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvites.map((inv) => (
                <tr key={inv.id} className="bg-amber-50/30">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={inv.name} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-800">{inv.name}</p>
                        <p className="text-xs text-slate-400">{inv.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">—</td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">Convite enviado em {formatDateBR(inv.invitedAt)}</td>
                  <td className="px-5 py-3.5">
                    <Badge status="pendente" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => resendMentorInvite(inv.id)}
                        className="flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100"
                      >
                        <RefreshCcw size={13} /> Reenviar
                      </button>
                      <button
                        onClick={() => setToRemove({ type: 'invite', id: inv.id, name: inv.name })}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={13} /> Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMentors.length === 0 && filteredInvites.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-400">Nenhum mentor encontrado.</p>
        )}
      </Card>

      {/* Convidar por e-mail */}
      <Modal
        open={formMode === 'invite'}
        onClose={resetForm}
        title="Convidar mentor por e-mail"
        description="Um convite pendente será criado. Ele passa a aparecer como mentor ativo assim que aceitar."
        footer={
          <>
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button icon={<Mail size={15} />} onClick={handleInviteSubmit}>
              Enviar convite
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleInviteSubmit}>
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do mentor" required />
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mentor@email.com" required />
        </form>
      </Modal>

      {/* Cadastro direto */}
      <Modal
        open={formMode === 'direct'}
        onClose={resetForm}
        title="Cadastrar mentor diretamente"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button icon={<UserPlus size={15} />} onClick={handleDirectSubmit}>
              Cadastrar mentor
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleDirectSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required />
            <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mentor@empresa.com" required />
          </div>
          <Input
            label="Especialidades / skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Ex: Liderança, Gestão de Times (separe por vírgula)"
          />
          <Textarea label="Bio curta" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conte um pouco sobre a experiência do mentor" />
          <MultiSelect
            label="Treinamento(s) vinculado(s)"
            options={programs.map((p) => ({ id: p.id, label: p.name }))}
            selected={selectedPrograms}
            onChange={setSelectedPrograms}
            hint="O mentor só aparece para alunos vinculados a esses treinamentos."
            emptyLabel="Crie um treinamento primeiro em Gestão de Treinamentos."
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        onConfirm={() => {
          if (!toRemove) return
          if (toRemove.type === 'mentor') removeMentor(toRemove.id)
          else removeMentorInvite(toRemove.id)
        }}
        title={`Remover ${toRemove?.name}?`}
        description="Essa pessoa deixará de aparecer para os alunos dos seus treinamentos."
        confirmLabel="Remover"
        danger
      />
    </DashboardLayout>
  )
}
