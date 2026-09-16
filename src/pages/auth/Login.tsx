import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, GraduationCap, Users } from 'lucide-react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useAuthStore } from '../../store/authStore'
import type { AccountType } from '../../types'

const typeConfig: Record<AccountType, { label: string; icon: typeof GraduationCap; redirect: string }> = {
  student: { label: 'Aluno', icon: GraduationCap, redirect: '/aluno' },
  mentor: { label: 'Mentor', icon: Users, redirect: '/mentor' },
  company: { label: 'Empresa', icon: Building2, redirect: '/empresa' },
}

const demoAccounts: { type: AccountType; label: string; value: string; hint: string }[] = [
  { type: 'student', label: 'Marina Duarte', value: 'marina.duarte@email.com', hint: 'aluna sem treinamento ativo' },
  { type: 'student', label: 'Rafael Nogueira', value: 'rafael.nogueira@email.com', hint: 'aluno com treinamento TechNova' },
  { type: 'mentor', label: 'Beatriz Lima', value: 'beatriz.lima@email.com', hint: 'mentora geral da plataforma' },
  { type: 'mentor', label: 'Eduardo Silva', value: 'eduardo.silva@technova.com.br', hint: 'mentor vinculado à TechNova' },
  { type: 'company', label: 'TechNova Soluções', value: 'patricia.menezes@technova.com.br', hint: 'painel de empresa' },
]

/** Senha compartilhada por todas as contas de demonstração semeadas no banco. */
const DEMO_PASSWORD = 'SkillBridge#2026'

export default function Login() {
  const [type, setType] = useState<AccountType>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const config = typeConfig[type]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(email, password)
      if (!user) {
        setError('E-mail ou senha inválidos.')
        return
      }
      // Redireciona pelo painel correspondente ao tipo real da conta (não pela aba escolhida) —
      // login é sempre por e-mail/senha, a aba é só um atalho de preenchimento.
      navigate(typeConfig[user.type].redirect)
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center gap-12 px-6 py-14">
        <div className="hidden flex-1 lg:block">
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 dark:text-slate-50">
            Continue construindo sua <span className="text-primary">trajetória</span> na SkillBridge
          </h1>
          <p className="mt-4 max-w-md text-slate-500 dark:text-slate-400">
            Cursos, mentoria e oportunidades em um só lugar. Entre com o tipo de conta certo para acessar seu painel.
          </p>
          <div className="mt-10 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Contas de demonstração <span className="font-normal normal-case text-slate-400">(senha: {DEMO_PASSWORD})</span>
            </p>
            {demoAccounts.map((acc) => (
              <button
                key={acc.value}
                onClick={() => {
                  setType(acc.type)
                  setEmail(acc.value)
                  setPassword(DEMO_PASSWORD)
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700/60 bg-white px-4 py-3 text-left text-sm shadow-soft transition-colors hover:border-primary-200 dark:bg-slate-800 dark:hover:border-primary-500/40"
              >
                <span>
                  <span className="block font-semibold text-slate-800 dark:text-slate-100">{acc.label}</span>
                  <span className="block text-xs text-slate-400">{acc.hint}</span>
                </span>
                <span className="rounded-full bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1 text-xs font-semibold text-primary-600">
                  {typeConfig[acc.type].label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Card padding="lg" className="w-full max-w-md">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Entrar na SkillBridge</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Escolha o tipo de conta para continuar.</p>

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
                    type === t ? 'border-primary bg-primary-50 dark:bg-primary-500/10 text-primary-700' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-200'
                  }`}
                >
                  <Icon size={18} />
                  {c.label}
                </button>
              )
            })}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Senha" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

            <Button type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? 'Entrando...' : `Entrar como ${config.label}`}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
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
