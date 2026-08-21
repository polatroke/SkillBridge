import { useState } from 'react'
import { Building2, Plus, Star, X } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MentorSidebar } from '../../components/layout/MentorSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Field'
import { Avatar } from '../../components/ui/Avatar'
import { useAuthStore } from '../../store/authStore'
import { useCurrentMentor, useDataStore } from '../../store/dataStore'

export default function MentorProfile() {
  const authUser = useAuthStore((s) => s.user)
  const mentor = useCurrentMentor(authUser?.id)
  const sessions = useDataStore((s) => s.mentorSessions)
  const companies = useDataStore((s) => s.companies)
  const programs = useDataStore((s) => s.programs)
  const getCompanyById = (id?: string) => companies.find((c) => c.id === id)
  const getProgramById = (id?: string) => programs.find((p) => p.id === id)
  const [newSkill, setNewSkill] = useState('')
  const [skills, setSkills] = useState<string[]>(mentor?.skills ?? [])

  if (!mentor) return null

  const reviews = sessions.filter((s) => s.mentorId === mentor.id && s.review)
  const company = getCompanyById(mentor.companyId)

  const addSkill = () => {
    if (!newSkill.trim()) return
    setSkills((s) => [...s, newSkill.trim()])
    setNewSkill('')
  }

  return (
    <DashboardLayout sidebar={<MentorSidebar />} profileTitle="Painel do Mentor">
      <PageHeader title="Perfil Profissional" description="Suas informações públicas como mentor(a), visíveis para os alunos na SkillBridge." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="text-center">
            <Avatar name={mentor.name} size="lg" className="mx-auto h-20 w-20 text-2xl" />
            <h2 className="mt-4 text-lg font-bold text-slate-900">{mentor.name}</h2>
            <p className="text-sm text-slate-400">{mentor.email}</p>
            <p className="mt-2 flex items-center justify-center gap-1 text-sm font-semibold text-slate-700">
              <Star size={14} className="text-cta" fill="currentColor" /> {mentor.rating || '—'} ({mentor.reviewsCount} avaliações)
            </p>
            {company && (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-cta-50 px-2.5 py-1 text-xs font-bold text-cta-700">
                <Building2 size={12} /> Mentor(a) da {company.name}
              </span>
            )}
          </Card>

          {mentor.programIds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Treinamentos vinculados</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {mentor.programIds.map((id) => {
                  const p = getProgramById(id)
                  return (
                    <div key={id} className="rounded-lg bg-primary-50/60 px-3 py-2 text-sm font-semibold text-primary-700">
                      {p?.name}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sobre você</CardTitle>
            </CardHeader>
            <Textarea label="Bio" defaultValue={mentor.bio} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Input label="Valor por sessão (R$)" type="number" defaultValue={mentor.pricePerSession} />
              <Input label="E-mail de contato" defaultValue={mentor.email} />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">Especialidades / skills</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600">
                    {skill}
                    <button onClick={() => setSkills((s) => s.filter((x) => x !== skill))} className="text-primary-300 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Adicionar especialidade"
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
                />
                <Button variant="secondary" icon={<Plus size={15} />} onClick={addSkill}>
                  Adicionar
                </Button>
              </div>
            </div>

            <Button className="mt-5">Salvar perfil</Button>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avaliações recebidas</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1 text-cta">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} fill={i < (r.rating ?? 0) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">“{r.review}”</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-slate-400">Nenhuma avaliação recebida ainda.</p>}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
