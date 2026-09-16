import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, MailCheck, Users } from 'lucide-react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Field'
import { signUpMentor, signUpStudent } from '../../lib/supabase/auth'
import { useAuthStore } from '../../store/authStore'

type Kind = 'student' | 'mentor'

export default function RegisterStudentMentor() {
  const [kind, setKind] = useState<Kind>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)

  const refresh = useAuthStore((s) => s.refresh)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const outcome =
        kind === 'student'
          ? await signUpStudent(name, email, password)
          : await signUpMentor(
              name,
              email,
              password,
              bio || 'Mentor(a) na plataforma SkillBridge.',
              skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            )
      if (outcome.pendingConfirmation) {
        setPendingConfirmation(true)
        return
      }
      await refresh()
      navigate(kind === 'student' ? '/aluno' : '/mentor')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (pendingConfirmation) {
    return (
      <PublicLayout>
        <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-14">
          <Card padding="lg" className="w-full text-center">
            <MailCheck className="mx-auto text-primary-600" size={40} />
            <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-50">Confirme seu e-mail</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Enviamos um link de confirmação para <strong>{email}</strong>. Depois de confirmar, volte e entre normalmente.
            </p>
            <Link to="/login" className="mt-6 inline-block font-semibold text-primary-600 hover:underline">
              Ir para o login
            </Link>
          </Card>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-14">
        <Card padding="lg" className="w-full">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Criar conta</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cadastre-se como aluno ou mentor usando e-mail e senha.</p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKind('student')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                kind === 'student' ? 'border-primary bg-primary-50 dark:bg-primary-500/10 text-primary-700' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-200'
              }`}
            >
              <GraduationCap size={20} />
              Aluno
            </button>
            <button
              type="button"
              onClick={() => setKind('mentor')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                kind === 'mentor' ? 'border-primary bg-primary-50 dark:bg-primary-500/10 text-primary-700' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-200'
              }`}
            >
              <Users size={20} />
              Mentor
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input label="Nome completo" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Senha" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

            {kind === 'mentor' && (
              <>
                <Input
                  label="Especialidades"
                  placeholder="Ex: UX Design, Carreira, Produto (separe por vírgula)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
                <Textarea label="Bio curta" placeholder="Conte um pouco sobre sua experiência" value={bio} onChange={(e) => setBio(e.target.value)} />
              </>
            )}

            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

            <Button type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? 'Criando conta...' : `Criar conta como ${kind === 'student' ? 'Aluno' : 'Mentor'}`}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            É uma empresa?{' '}
            <Link to="/cadastro/empresa" className="font-semibold text-primary-600 hover:underline">
              Cadastre sua empresa
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  )
}
