import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Building2, GraduationCap, Users } from 'lucide-react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import { useAuthStore } from '../../store/authStore'
import type { AccountType } from '../../types'
import { accountTypeForPath, homePathFor } from '../../lib/routes'
import { friendlyError } from '../../lib/errors'

const typeConfig: Record<AccountType, { label: string; icon: typeof GraduationCap }> = {
  student: { label: 'Aluno', icon: GraduationCap },
  mentor: { label: 'Mentor', icon: Users },
  company: { label: 'Empresa', icon: Building2 },
}

export default function Login() {
  // Quem chega de um link protegido (ex: card de curso na tela inicial) volta para lá depois de entrar.
  const rawFrom = (useLocation().state as { from?: string } | null)?.from
  // Só caminhos internos do próprio app (evita redirecionar para "//outro-site").
  const from = rawFrom && rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : undefined
  const fromType = accountTypeForPath(from)
  const [type, setType] = useState<AccountType>(fromType ?? 'student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const login = useAuthStore((s) => s.login)
  const loggedType = useAuthStore((s) => s.accountType)
  const authLoading = useAuthStore((s) => s.loading)
  const navigate = useNavigate()

  const config = typeConfig[type]

  // Já está logado (ex: voltou para /login pelo histórico): segue para o painel em vez de pedir login de novo.
  if (!authLoading && loggedType && !submitting) {
    return <Navigate to={from && fromType === loggedType ? from : homePathFor(loggedType)} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // A aba escolhida é obrigatória: uma conta de mentor não entra pela aba Aluno/Empresa.
      await login(email, password, type)
      navigate(from && fromType === type ? from : homePathFor(type), { replace: true })
    } catch (err) {
      setError(friendlyError(err, 'Não foi possível entrar agora. Tente novamente.'))
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
        </div>

        <Card padding="lg" className="w-full max-w-md">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Entrar na SkillBridge</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {fromType ? `Entre com sua conta de ${typeConfig[fromType].label} para continuar de onde parou.` : 'Escolha o tipo de conta para continuar.'}
          </p>

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
