import { useState } from 'react'
import { Building2, Plus, Trash2 } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { Avatar } from '../../components/ui/Avatar'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'

const sectors = ['Tecnologia', 'Varejo', 'Indústria', 'Serviços Financeiros', 'Saúde', 'Educação', 'Outro']

export default function CompanySettings() {
  const authUser = useAuthStore((s) => s.user)
  const company = authUser?.type === 'company' ? authUser : undefined
  const updateCompanyProfile = useDataStore((s) => s.updateCompanyProfile)

  const [admins, setAdmins] = useState(company?.adminUsers ?? [])
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')

  const [name, setName] = useState(company?.name ?? '')
  const [razaoSocial, setRazaoSocial] = useState(company?.razaoSocial ?? '')
  const [sector, setSector] = useState(company?.sector ?? sectors[0])
  const [email, setEmail] = useState(company?.email ?? '')
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!company) return null

  const addAdmin = () => {
    if (!newAdminName || !newAdminEmail) return
    setAdmins((a) => [...a, { name: newAdminName, email: newAdminEmail, role: 'Administrador' }])
    setNewAdminName('')
    setNewAdminEmail('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await updateCompanyProfile(company.id, { name, razaoSocial, sector, email, logoUrl })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout sidebar={<CompanySidebar />} profileTitle="Painel da Empresa">
      <PageHeader title="Configurações da Empresa" description="Dados cadastrais, identidade visual e administradores do painel." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dados cadastrais</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nome fantasia" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="CNPJ" defaultValue={company.cnpj} disabled />
            </div>
            <Input label="Razão social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Setor" value={sector} onChange={(e) => setSector(e.target.value)}>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <Input label="E-mail corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Input label="URL do logo" placeholder="https://..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            <div className="mt-2 flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
              {saved && <span className="text-sm font-semibold text-emerald-600">Salvo!</span>}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identidade</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-center rounded-xl bg-primary-50/60 dark:bg-primary-500/10 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-soft dark:bg-slate-700 dark:text-primary-300">
              <Building2 size={28} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">{company.name}</p>
            <p className="text-xs text-slate-400">{company.cnpj}</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usuários administradores do painel</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {admins.map((admin, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700/60 p-3.5">
              <div className="flex items-center gap-3">
                <Avatar name={admin.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{admin.name}</p>
                  <p className="text-xs text-slate-400">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{admin.role}</span>
                <button
                  onClick={() => setAdmins((a) => a.filter((_, idx) => idx !== i))}
                  className="text-slate-300 hover:text-red-500"
                  aria-label="Remover administrador"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-700/60 pt-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input label="Nome" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="Nome do administrador" />
          </div>
          <div className="flex-1">
            <Input label="E-mail" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="email@empresa.com" />
          </div>
          <Button icon={<Plus size={15} />} onClick={addAdmin}>
            Adicionar
          </Button>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Novos administradores precisam criar login próprio em /cadastro/empresa; esta lista é só de exibição nesta versão.
        </p>
      </Card>
    </DashboardLayout>
  )
}
