import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, GraduationCap, Users } from 'lucide-react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useAuthStore } from '../../store/authStore'
import type { AccountType } from '../../types'

const typeConfig: Record<AccountType, { label: string; icon: typeof GraduationCap; idLabel: string; idPlaceholder: string; redirect: string }> = {
  student: { label: 'Aluno', icon: GraduationCap, idLabel: 'E-mail', idPlaceholder: 'voce@email.com', redirect: '/aluno' },
  mentor: { label: 'Mentor', icon: Users, idLabel: 'E-mail', idPlaceholder: 'voce@email.com', redirect: '/mentor' },
  company: { label: 'Empresa', icon: Building2, idLabel: 'CNPJ', idPlaceholder: '00.000.000/0000-00', redirect: '/empresa' },
}

const demoAccounts: { type: AccountType; label: string; value: string; hint: string }[] = [
  { type: 'student', label: 'Marina Duarte', value: 'marina.duarte@email.com', hint: 'aluna sem treinamento ativo' },
  { type: 'student', label: 'Rafael Nogueira', value: 'rafael.nogueira@email.com', hint: 'aluno com treinamento TechNova' },
  { type: 'mentor', label: 'Beatriz Lima', value: 'beatriz.lima@email.com', hint: 'mentora geral da plataforma' },
  { type: 'mentor', label: 'Eduardo Silva', value: 'eduardo.silva@technova.com.br', hint: 'mentor vinculado à TechNova' },
  { type: 'company', label: 'TechNova Soluções', value: '12.345.678/0001-90', hint: 'painel de empresa' },
]

export default function Login() {
  const [type, setType] = useState<AccountType>('student')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const config = typeConfig[type]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(type, identifier || (type === 'company' ? '12.345.678/0001-90' : 'marina.duarte@email.com'))
    navigate(config.redirect)
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center gap-12 px-6 py-14">
        <div className="hidden flex-1 lg:block">
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900">
            Continue construindo sua <span className="text-primary">trajetória</span> na SkillBridge
          </h1>
          <p className="mt-4 max-w-md text-slate-500">
            Cursos, mentoria e oportunidades em um só lugar. Entre com o tipo de conta certo para acessar seu painel.
          </p>
          <div className="mt-10 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Contas de demonstração</p>
            {demoAccounts.map((acc) => (
              <button
                key={acc.value}
                onClick={() => {
                  setType(acc.type)
                  setIdentifier(acc.value)
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-left text-sm shadow-soft transition-colors hover:border-primary-200"
              >
                <span>
                  <span className="block font-semibold text-slate-800">{acc.label}</span>
                  <span className="block text-xs text-slate-400">{acc.hint}</span>
                </span>
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600">
                  {typeConfig[acc.type].label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Card padding="lg" className="w-full max-w-md">
          <h2 className="text-2xl font-extrabold text-slate-900">Entrar na SkillBridge</h2>
          <p className="mt-1 text-sm text-slate-500">Escolha o tipo de conta para continuar.</p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {(Object.keys(typeConfig) as AccountType[]).map((t) => {
              const c = typeConfig[t]
              const Icon = c.icon
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-colors ${
                    type === t ? 'border-primary bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-primary-200'
                  }`}
                >
                  <Icon size={18} />
                  {c.label}
                </button>
              )
            })}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label={config.idLabel}
              placeholder={config.idPlaceholder}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Input label="Senha" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <Button type="submit" fullWidth size="lg">
              Entrar como {config.label}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold text-primary-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  )
}
