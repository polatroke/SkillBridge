import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Users } from 'lucide-react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Field'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'

type Kind = 'student' | 'mentor'

export default function RegisterStudentMentor() {
  const [kind, setKind] = useState<Kind>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')

  const registerStudent = useDataStore((s) => s.registerStudent)
  const registerMentor = useDataStore((s) => s.registerMentor)
  const loginAs = useAuthStore((s) => s.loginAs)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (kind === 'student') {
      const student = registerStudent(name, email)
      loginAs(student)
      navigate('/aluno')
    } else {
      const mentor = registerMentor(
        name,
        email,
        bio || 'Mentor(a) na plataforma SkillBridge.',
        skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      )
      loginAs(mentor)
      navigate('/mentor')
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-14">
        <Card padding="lg" className="w-full">
          <h1 className="text-2xl font-extrabold text-slate-900">Criar conta</h1>
          <p className="mt-1 text-sm text-slate-500">Cadastre-se como aluno ou mentor usando e-mail e senha.</p>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKind('student')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                kind === 'student' ? 'border-primary bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-primary-200'
              }`}
            >
              <GraduationCap size={20} />
              Aluno
            </button>
            <button
              type="button"
              onClick={() => setKind('mentor')}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${
                kind === 'mentor' ? 'border-primary bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-primary-200'
              }`}
            >
              <Users size={20} />
              Mentor
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input label="Nome completo" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Senha" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

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

            <Button type="submit" fullWidth size="lg">
              Criar conta como {kind === 'student' ? 'Aluno' : 'Mentor'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            É uma empresa?{' '}
            <Link to="/cadastro/empresa" className="font-semibold text-primary-600 hover:underline">
              Cadastre sua empresa
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-slate-500">
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
