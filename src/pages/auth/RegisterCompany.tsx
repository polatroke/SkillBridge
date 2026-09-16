import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { signUpCompany } from '../../lib/supabase/auth'
import { useAuthStore } from '../../store/authStore'

const sectors = ['Tecnologia', 'Varejo', 'Indústria', 'Serviços Financeiros', 'Saúde', 'Educação', 'Outro']

export default function RegisterCompany() {
  const [cnpj, setCnpj] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')
  const [name, setName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [email, setEmail] = useState('')
  const [sector, setSector] = useState(sectors[0])
  const [password, setPassword] = useState('')
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
      const { pendingConfirmation } = await signUpCompany({
        cnpj,
        razaoSocial,
        name: name || razaoSocial,
        email,
        sector,
        adminName: adminName || name || razaoSocial,
        password,
      })
      if (pendingConfirmation) {
        setPendingConfirmation(true)
        return
      }
      await refresh()
      navigate('/empresa')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (pendingConfirmation) {
    return (
      <PublicLayout>
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-14">
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
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-14">
        <Card padding="lg" className="w-full">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Cadastrar empresa</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Crie treinamentos corporativos fechados, com cursos e mentores próprios, restritos aos seus alunos.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input label="CNPJ" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
            <Input
              label="Razão social"
              placeholder="Razão social da empresa"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              required
            />
            <Input label="Nome fantasia" placeholder="Como a empresa aparecerá na plataforma" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Seu nome" placeholder="Nome de quem está cadastrando" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Setor" value={sector} onChange={(e) => setSector(e.target.value)}>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <Input label="E-mail corporativo" type="email" placeholder="contato@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Input label="Senha de acesso" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

            <Button type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? 'Criando conta...' : 'Criar conta da empresa'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            É aluno ou mentor?{' '}
            <Link to="/cadastro" className="font-semibold text-primary-600 hover:underline">
              Cadastre-se por aqui
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
