import { useEffect, useState } from 'react'
import { Building2, Plus, Trash2 } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { Avatar } from '../../components/ui/Avatar'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { supabase } from '../../lib/supabaseClient'
import { SECTORS } from '../../lib/catalog'
import { friendlyError } from '../../lib/errors'
import { cleanName, safeHttpUrl } from '../../lib/validation'

export default function CompanySettings() {
  const authUser = useAuthStore((s) => s.user)
  const company = authUser?.type === 'company' ? authUser : undefined
  const updateCompanyProfile = useDataStore((s) => s.updateCompanyProfile)
  const addCompanyAdmin = useDataStore((s) => s.addCompanyAdmin)
  const removeCompanyAdmin = useDataStore((s) => s.removeCompanyAdmin)

  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminRole, setNewAdminRole] = useState('Administrador')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
  const [adminAdded, setAdminAdded] = useState(false)
  const [toRemove, setToRemove] = useState<{ id: string; name: string } | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [logoBroken, setLogoBroken] = useState(false)
  /** Login de quem está usando o painel: não pode remover o próprio acesso. */
  const [myAdminId, setMyAdminId] = useState<string | null>(null)

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setMyAdminId(data.session?.user.id ?? null))
  }, [])

  const [name, setName] = useState(company?.name ?? '')
  const [razaoSocial, setRazaoSocial] = useState(company?.razaoSocial ?? '')
  const [sector, setSector] = useState<string>(company?.sector ?? SECTORS[0])
  const [email, setEmail] = useState(company?.email ?? '')
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!company) return null

  const admins = company.adminUsers

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError(null)
    setAdminAdded(false)
    const adminName = cleanName(newAdminName)
    if (!adminName) {
      setAdminError('Informe o nome do administrador.')
      return
    }
    setAddingAdmin(true)
    try {
      await addCompanyAdmin({ name: adminName, email: newAdminEmail.trim().toLowerCase(), password: newAdminPassword, role: newAdminRole.trim() || 'Administrador' })
      setNewAdminName('')
      setNewAdminEmail('')
      setNewAdminPassword('')
      setNewAdminRole('Administrador')
      setAdminAdded(true)
    } catch (err) {
      setAdminError(friendlyError(err, 'Não foi possível adicionar o administrador.'))
    } finally {
      setAddingAdmin(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    setSaveError(null)
    const cleanFantasia = cleanName(name)
    const cleanRazao = cleanName(razaoSocial)
    if (!cleanFantasia || !cleanRazao) {
      setSaveError('Preencha nome fantasia e razão social.')
      return
    }
    const logo = logoUrl.trim()
    if (logo && !safeHttpUrl(logo)) {
      setSaveError('A URL do logo precisa começar com http:// ou https://.')
      return
    }
    setSaving(true)
    try {
      await updateCompanyProfile(company.id, { name: cleanFantasia, razaoSocial: cleanRazao, sector, email: email.trim(), logoUrl: logo })
      setSaved(true)
    } catch (err) {
      setSaveError(friendlyError(err, 'Não foi possível salvar. Verifique os dados e tente novamente.'))
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
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Nome fantasia" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="CNPJ" defaultValue={company.cnpj} disabled />
            </div>
            <Input label="Razão social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="Setor" value={sector} onChange={(e) => setSector(e.target.value)}>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <Input label="E-mail corporativo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Input
              label="URL do logo"
              type="url"
              placeholder="https://..."
              value={logoUrl}
              onChange={(e) => {
                setLogoUrl(e.target.value)
                setLogoBroken(false)
              }}
              hint="A pré-visualização aparece no cartão de identidade ao lado."
            />
            <div className="mt-2 flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
              {saved && <span className="text-sm font-semibold text-emerald-600">Salvo!</span>}
              {saveError && <span className="text-sm font-semibold text-red-600 dark:text-red-400">{saveError}</span>}
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identidade</CardTitle>
          </CardHeader>
          <div className="flex flex-col items-center rounded-xl bg-primary-50/60 dark:bg-primary-500/10 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white text-primary-600 shadow-soft dark:bg-slate-700 dark:text-primary-300">
              {safeHttpUrl(logoUrl) && !logoBroken ? (
                <img src={safeHttpUrl(logoUrl)!} alt={`Logo da ${name || company.name}`} onError={() => setLogoBroken(true)} className="h-full w-full object-contain" />
              ) : (
                <Building2 size={28} />
              )}
            </div>
            <p className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">{name || company.name}</p>
            <p className="text-xs text-slate-400">{company.cnpj}</p>
            {logoBroken && <p className="mt-2 text-xs font-semibold text-amber-600">Não foi possível carregar a imagem dessa URL.</p>}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usuários administradores do painel</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-700/60 p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={admin.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {admin.name}
                    {admin.id === myAdminId && <span className="ml-2 text-xs font-normal text-slate-400">(você)</span>}
                  </p>
                  <p className="text-xs text-slate-400">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{admin.role}</span>
                {myAdminId && admin.id !== myAdminId && (
                  <button
                    onClick={() => setToRemove({ id: admin.id, name: admin.name })}
                    className="text-slate-300 hover:text-red-500"
                    aria-label={`Remover ${admin.name}`}
                    title="Remover acesso"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-700/60" onSubmit={addAdmin}>
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Adicionar administrador</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Nome" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="Nome completo" required />
            <Input label="E-mail" type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="email@empresa.com" required />
            <Input label="Cargo" value={newAdminRole} onChange={(e) => setNewAdminRole(e.target.value)} placeholder="Ex: Gerente de RH" />
            <Input
              label="Senha provisória"
              type="password"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="submit" icon={<Plus size={15} />} disabled={addingAdmin}>
              {addingAdmin ? 'Adicionando...' : 'Adicionar'}
            </Button>
            {adminAdded && <span className="text-sm font-semibold text-emerald-600">Administrador criado! Envie o e-mail e a senha provisória para ele.</span>}
            {adminError && <span className="text-sm font-semibold text-red-600 dark:text-red-400">{adminError}</span>}
          </div>
          <p className="mt-3 text-xs text-slate-400">O novo administrador entra pela aba Empresa com esse e-mail e a senha provisória.</p>
        </form>
      </Card>

      <ConfirmDialog
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        onConfirm={async () => {
          if (toRemove) await removeCompanyAdmin(toRemove.id)
        }}
        title={`Remover ${toRemove?.name ?? ''}?`}
        description="Essa pessoa perde o acesso ao painel da empresa e o login dela é excluído."
        confirmLabel="Remover"
        danger
      />
    </DashboardLayout>
  )
}
