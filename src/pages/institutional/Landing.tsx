import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, BookOpen, Briefcase, Building2, Star, Users } from 'lucide-react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import { courses } from '../../mocks/courses'
import { mentors } from '../../mocks/mentors'

const publicCourses = courses.filter((c) => !c.companyId && c.status === 'publicado').slice(0, 4)
const publicMentors = mentors.filter((m) => !m.companyId).slice(0, 3)

const stats = [
  { label: 'Alunos ativos', value: '38 mil+' },
  { label: 'Mentores especialistas', value: '420+' },
  { label: 'Empresas parceiras', value: '95+' },
  { label: 'Certificados emitidos', value: '61 mil+' },
]

const testimonials = [
  {
    name: 'Ana Beatriz Rocha',
    role: 'Analista de Dados, ex-aluna',
    quote: 'A mentoria com a SkillBridge foi decisiva pra minha transição de carreira. Em 4 meses consegui minha primeira vaga em dados.',
  },
  {
    name: 'Thiago Marins',
    role: 'Head de RH, cliente corporativo',
    quote: 'Criamos nossa trilha interna de talentos em poucos dias. Hoje conseguimos capacitar e reter os melhores times com a plataforma.',
  },
  {
    name: 'Larissa Guimarães',
    role: 'Mentora de Produto',
    quote: 'A plataforma facilita demais gerenciar minha agenda de mentorias e acompanhar a evolução de cada mentorado.',
  },
]

export default function Landing() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary-100 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-cta-100 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-bold text-primary-700 ring-1 ring-primary-200">
              <BadgeCheck size={14} /> Upskilling + Mentoria + Empresas
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              A ponte entre <span className="text-primary">aprender</span> e <span className="text-cta">conquistar</span> sua próxima oportunidade
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-500">
              Cursos práticos, mentoria com especialistas e trilhas corporativas exclusivas — tudo em uma única plataforma de upskilling.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/cadastro">
                <Button variant="cta" size="lg" iconRight={<ArrowRight size={18} />}>
                  Criar conta grátis
                </Button>
              </Link>
              <Link to="/cadastro/empresa">
                <Button variant="secondary" size="lg" icon={<Building2 size={18} />}>
                  Sou uma empresa
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <Card padding="lg" className="rotate-2">
              <div className="flex items-center gap-3">
                <Avatar name="Rafael Nogueira" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Rafael Nogueira</p>
                  <p className="text-xs text-slate-400">Trilha de Talentos TechNova</p>
                </div>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 w-2/3 rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-xs font-semibold text-primary-600">67% da trilha concluída</p>
            </Card>
            <Card padding="md" className="absolute -bottom-8 -left-10 w-56 -rotate-3 shadow-card">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cta-50 text-cta-600">
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-sm font-bold text-slate-800">4.9/5</p>
              </div>
              <p className="mt-1 text-xs text-slate-500">avaliação média das mentorias</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Cursos */}
      <section id="cursos" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Cursos em destaque</h2>
            <p className="mt-1 text-slate-500">Catálogo público, aberto para toda a comunidade SkillBridge.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {publicCourses.map((c) => (
            <Card key={c.id} hoverable padding="none" className="overflow-hidden">
              <img src={c.coverUrl} alt={c.title} className="h-36 w-full object-cover" />
              <div className="p-5">
                <span className="text-xs font-bold uppercase tracking-wide text-primary-500">{c.category}</span>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-800">{c.title}</h3>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} /> {c.totalHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={13} className="text-cta" fill="currentColor" /> {c.rating}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Mentoria */}
      <section id="mentoria" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Mentoria com quem já viveu o que você quer viver</h2>
            <p className="mt-1 text-slate-500">Agende sessões 1:1 com especialistas de mercado.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {publicMentors.map((m) => (
              <Card key={m.id} hoverable>
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="lg" />
                  <div>
                    <p className="font-bold text-slate-800">{m.name}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <Star size={12} className="text-cta" fill="currentColor" /> {m.rating} ({m.reviewsCount})
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-500">{m.bio}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.skills.slice(0, 2).map((s) => (
                    <span key={s} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-600">
                      {s}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Para empresas */}
      <section id="empresas" className="mx-auto max-w-7xl px-6 py-16">
        <Card padding="lg" className="grid grid-cols-1 items-center gap-10 bg-gradient-to-br from-primary to-primary-700 text-white lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold">
              <Building2 size={14} /> SkillBridge para Empresas
            </span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight">Crie trilhas de capacitação exclusivas para o seu time</h2>
            <p className="mt-3 text-primary-100">
              Cursos e mentores próprios, vagas internas e acompanhamento completo — tudo restrito aos alunos vinculados aos seus programas.
            </p>
            <Link to="/cadastro/empresa" className="mt-6 inline-block">
              <Button variant="cta" size="lg" iconRight={<ArrowRight size={18} />}>
                Cadastrar minha empresa
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: BookOpen, label: 'Cursos exclusivos' },
              { icon: Users, label: 'Mentores dedicados' },
              { icon: Briefcase, label: 'Vagas internas' },
              { icon: BadgeCheck, label: 'Relatórios de progresso' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-xl bg-white/10 p-4">
                <f.icon size={20} />
                <span className="text-sm font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-2xl font-extrabold text-slate-900 sm:text-3xl">O que dizem sobre a SkillBridge</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <div className="flex gap-0.5 text-cta">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-3 text-sm text-slate-600">“{t.quote}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar name={t.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <Card padding="lg" className="flex flex-col items-center gap-5 bg-cta text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-extrabold">Pronto para dar o próximo passo na sua carreira?</h2>
            <p className="mt-1 text-cta-50">Crie sua conta gratuita e comece a aprender hoje mesmo.</p>
          </div>
          <Link to="/cadastro">
            <Button size="lg" className="whitespace-nowrap bg-white text-cta-600 hover:bg-cta-50">
              Criar conta grátis
            </Button>
          </Link>
        </Card>
      </section>
    </PublicLayout>
  )
}
