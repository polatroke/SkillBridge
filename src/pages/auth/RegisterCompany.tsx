import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'

const sectors = ['Tecnologia', 'Varejo', 'Indústria', 'Serviços Financeiros', 'Saúde', 'Educação', 'Outro']

export default function RegisterCompany() {
  const [cnpj, setCnpj] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sector, setSector] = useState(sectors[0])
  const [password, setPassword] = useState('')

  const registerCompany = useDataStore((s) => s.registerCompany)
  const loginAs = useAuthStore((s) => s.loginAs)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const company = registerCompany({ cnpj, razaoSocial, name: name || razaoSocial, email, sector })
    loginAs(company)
    navigate('/empresa')
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-14">
        <Card padding="lg" className="w-full">
          <h1 className="text-2xl font-extrabold text-slate-900">Cadastrar empresa</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crie treinamentos corporativos fechados, com cursos e mentores próprios, restritos aos seus alunos.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="CNPJ"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
            />
            <Input
              label="Razão social"
              placeholder="Razão social da empresa"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              required
            />
            <Input label="Nome fantasia" placeholder="Como a empresa aparecerá na plataforma" value={name} onChange={(e) => setName(e.target.value)} required />
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
            <Input label="Senha de acesso" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <Button type="submit" fullWidth size="lg">
              Criar conta da empresa
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            É aluno ou mentor?{' '}
            <Link to="/cadastro" className="font-semibold text-primary-600 hover:underline">
              Cadastre-se por aqui
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
