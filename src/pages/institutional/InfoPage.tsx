import { useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Building2, Check, ChevronDown, GraduationCap, HeartHandshake, Mail, Newspaper, Send, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { PRESS_EMAIL, SALES_EMAIL, SUPPORT_EMAIL, mailtoLink } from '../../lib/site'
import type { InfoSlug } from './infoPages'

interface PageContent {
  eyebrow: string
  title: string
  intro: string
  body: ReactNode
}

const UPDATED_AT = '16/10/2026'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, children }: { icon: typeof Users; title: string; children: ReactNode }) {
  return (
    <Card>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
        <Icon size={20} />
      </div>
      <p className="mt-4 font-bold text-slate-800 dark:text-slate-100">{title}</p>
      <div className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{children}</div>
    </Card>
  )
}

function CtaLink({ to, children, variant = 'primary' }: { to: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'cta' }) {
  return (
    <ButtonLink to={to} variant={variant} iconRight={<ArrowRight size={16} />}>
        {children}
      </ButtonLink>
  )
}

const faq: { q: string; a: ReactNode }[] = [
  {
    q: 'Como me matriculo em um curso?',
    a: 'Entre como aluno, abra "Explorar Cursos", escolha o curso e clique em "Matricular-se". O curso passa a aparecer no seu painel e você pode assistir às aulas na ordem que preferir.',
  },
  {
    q: 'Como recebo o certificado?',
    a: 'Marque todas as aulas do curso como concluídas. O certificado é emitido na hora e fica em "Perfil" → "Certificados", de onde você pode imprimir ou salvar em PDF.',
  },
  {
    q: 'Como agendo uma mentoria?',
    a: 'Em "Mentoria", escolha um mentor com horários livres e clique em "Agendar". A sessão é marcada para a próxima data daquele dia da semana; você acompanha tudo em "Minhas sessões".',
  },
  {
    q: 'Posso cancelar ou avaliar uma mentoria?',
    a: 'Sim. Sessões futuras podem ser canceladas em "Minhas sessões" (o horário volta a ficar livre para outros alunos). Depois que a sessão acontece, o botão "Avaliar" aparece para você dar a nota e o comentário.',
  },
  {
    q: 'Como entro no treinamento de uma empresa?',
    a: 'A empresa vincula o seu e-mail de aluno ao treinamento (você precisa já ter conta) ou aprova a sua solicitação. A partir daí, os cursos, mentores e vagas exclusivos do treinamento aparecem automaticamente no seu painel.',
  },
  {
    q: 'Por que não vejo nenhuma vaga?',
    a: 'Vagas na SkillBridge são sempre exclusivas de um treinamento corporativo. Elas aparecem em "Vagas" quando você está vinculado(a) a um treinamento que tenha vagas abertas.',
  },
  {
    q: 'Sou mentor. Como defino meus horários?',
    a: 'No painel do mentor, acesse "Horários Disponíveis" e adicione os períodos da semana em que você atende. Horários já reservados por alunos ficam bloqueados até a sessão acontecer ou ser cancelada.',
  },
  {
    q: 'Não consigo entrar na minha conta.',
    a: (
      <>
        Confira se você selecionou a aba certa (Aluno, Mentor ou Empresa): cada conta só entra pela aba do seu tipo. Se ainda assim não funcionar,{' '}
        <Link to="/contato?assunto=suporte" className="font-semibold text-primary-600 hover:underline dark:text-primary-300">
          fale com o suporte
        </Link>
        .
      </>
    ),
  },
]

const subjects = [
  { value: 'suporte', label: 'Suporte / problema na conta', to: SUPPORT_EMAIL },
  { value: 'comercial', label: 'Quero a SkillBridge na minha empresa', to: SALES_EMAIL },
  { value: 'parcerias', label: 'Parcerias', to: SALES_EMAIL },
  { value: 'imprensa', label: 'Imprensa', to: PRESS_EMAIL },
  { value: 'outro', label: 'Outro assunto', to: SUPPORT_EMAIL },
]

function ContactForm() {
  const [searchParams] = useSearchParams()
  const initialSubject = subjects.some((s) => s.value === searchParams.get('assunto')) ? searchParams.get('assunto')! : 'suporte'
  const [subject, setSubject] = useState(initialSubject)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const target = subjects.find((s) => s.value === subject) ?? subjects[0]
    const body = `${message}\n\n—\n${name}\n${email}`
    window.location.href = mailtoLink(target.to, `[SkillBridge] ${target.label}`, body)
    setSent(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envie uma mensagem</CardTitle>
      </CardHeader>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Seu e-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Select label="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Textarea label="Mensagem" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} placeholder="Conte como podemos ajudar" />
        <Button type="submit" icon={<Send size={15} />}>
          Enviar mensagem
        </Button>
        {sent && (
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Abrimos o seu aplicativo de e-mail com a mensagem pronta — é só confirmar o envio por lá.
          </p>
        )}
      </form>
    </Card>
  )
}

const pages: Record<InfoSlug, PageContent> = {
  precos: {
    eyebrow: 'Planos',
    title: 'Preços simples para cada perfil',
    intro: 'Aprender e mentorar na SkillBridge é gratuito. Empresas contratam o painel corporativo para criar treinamentos exclusivos.',
    body: (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[
          {
            icon: GraduationCap,
            name: 'Aluno',
            price: 'Grátis',
            items: ['Catálogo público de cursos', 'Certificado ao concluir', 'Mentorias com especialistas', 'Acesso a treinamentos de empresas parceiras'],
            cta: { to: '/cadastro', label: 'Criar conta de aluno' },
          },
          {
            icon: Users,
            name: 'Mentor',
            price: 'Grátis',
            items: ['Perfil público de mentor', 'Agenda de horários semanais', 'Atividades e chat com mentorados', 'Você define o valor da sua sessão'],
            cta: { to: '/cadastro?tipo=mentor', label: 'Quero ser mentor' },
          },
          {
            icon: Building2,
            name: 'Empresa',
            price: 'Sob consulta',
            items: ['Treinamentos fechados para o seu time', 'Cursos e mentores próprios', 'Vagas internas por treinamento', 'Relatórios de progresso'],
            cta: { to: '/cadastro/empresa', label: 'Cadastrar empresa' },
          },
        ].map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <plan.icon size={22} className="text-primary-600 dark:text-primary-300" />
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-400">{plan.name}</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-slate-50">{plan.price}</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <CtaLink to={plan.cta.to} variant={plan.name === 'Empresa' ? 'cta' : 'secondary'}>
                {plan.cta.label}
              </CtaLink>
            </div>
          </Card>
        ))}
      </div>
    ),
  },
  sobre: {
    eyebrow: 'Institucional',
    title: 'Sobre a SkillBridge',
    intro: 'Somos a ponte entre aprender e conquistar a próxima oportunidade: cursos práticos, mentoria com quem já fez e trilhas corporativas em uma única plataforma.',
    body: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard icon={GraduationCap} title="Upskilling prático">
            Cursos curtos e aplicados, com progresso por aula e certificado ao concluir.
          </FeatureCard>
          <FeatureCard icon={Users} title="Mentoria 1:1">
            Especialistas de mercado acompanham cada aluno com sessões, atividades e conversas.
          </FeatureCard>
          <FeatureCard icon={Building2} title="Trilhas corporativas">
            Empresas criam treinamentos fechados com cursos, mentores e vagas exclusivas para o seu time.
          </FeatureCard>
        </div>
        <Card className="space-y-6">
          <Section title="Nossa missão">
            <p>Encurtar a distância entre o que as pessoas sabem hoje e o que o mercado precisa amanhã, conectando aprendizado, orientação e oportunidades reais.</p>
          </Section>
          <Section title="Como fazemos">
            <p>
              Alunos aprendem no catálogo público e com mentores; empresas usam a mesma base para capacitar e reter talentos, com cada conteúdo visível só para quem
              está no treinamento certo.
            </p>
          </Section>
        </Card>
      </div>
    ),
  },
  carreiras: {
    eyebrow: 'Trabalhe conosco',
    title: 'Carreiras na SkillBridge',
    intro: 'Queremos gente que gosta de ensinar, aprender e construir produtos que mudam trajetórias.',
    body: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard icon={Sparkles} title="Aprendizado contínuo">
            Todo o time tem acesso ao catálogo completo e a mentorias internas.
          </FeatureCard>
          <FeatureCard icon={HeartHandshake} title="Impacto real">
            Cada melhoria no produto ajuda alguém a dar o próximo passo na carreira.
          </FeatureCard>
          <FeatureCard icon={Users} title="Trabalho remoto">
            Times distribuídos pelo Brasil, com encontros presenciais periódicos.
          </FeatureCard>
        </div>
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">Não há vagas abertas no momento</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Envie seu currículo mesmo assim: guardamos os perfis para os próximos processos.</p>
          </div>
          <CtaLink to="/contato?assunto=outro">Enviar currículo</CtaLink>
        </Card>
      </div>
    ),
  },
  imprensa: {
    eyebrow: 'Novidades',
    title: 'Imprensa e novidades',
    intro: 'Acompanhe o que há de novo na plataforma e fale com a nossa assessoria.',
    body: (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>O que há de novo</CardTitle>
          </CardHeader>
          <ul className="space-y-4">
            {[
              { title: 'Módulo do aluno', text: 'Aulas com progresso salvo, certificados automáticos, atividades com correção do mentor e avaliação das mentorias.' },
              { title: 'Chat de dúvidas', text: 'Alunos e mentores conversam fora das sessões, com aviso de mensagens não lidas.' },
              { title: 'Treinamentos corporativos', text: 'Empresas criam programas fechados com cursos, mentores e vagas internas para o seu time.' },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <Newspaper size={18} className="mt-0.5 shrink-0 text-primary-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">Assessoria de imprensa</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pedidos de entrevista, dados e materiais institucionais.</p>
          </div>
          <a href={mailtoLink(PRESS_EMAIL, '[SkillBridge] Imprensa')}>
            <Button variant="secondary" icon={<Mail size={15} />}>
              {PRESS_EMAIL}
            </Button>
          </a>
        </Card>
      </div>
    ),
  },
  parceiros: {
    eyebrow: 'Parcerias',
    title: 'Seja parceiro da SkillBridge',
    intro: 'Empresas, especialistas e instituições de ensino constroem a plataforma com a gente.',
    body: (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="flex flex-col">
          <Building2 size={22} className="text-primary-600 dark:text-primary-300" />
          <p className="mt-4 font-bold text-slate-800 dark:text-slate-100">Empresas</p>
          <p className="mt-1.5 flex-1 text-sm text-slate-500 dark:text-slate-400">Crie treinamentos exclusivos, publique cursos próprios e encontre talentos para as suas vagas.</p>
          <div className="mt-5">
            <CtaLink to="/cadastro/empresa" variant="cta">
              Cadastrar empresa
            </CtaLink>
          </div>
        </Card>
        <Card className="flex flex-col">
          <Users size={22} className="text-primary-600 dark:text-primary-300" />
          <p className="mt-4 font-bold text-slate-800 dark:text-slate-100">Mentores</p>
          <p className="mt-1.5 flex-1 text-sm text-slate-500 dark:text-slate-400">Compartilhe sua experiência com alunos de todo o Brasil, no seu horário.</p>
          <div className="mt-5">
            <CtaLink to="/cadastro?tipo=mentor" variant="secondary">
              Quero ser mentor
            </CtaLink>
          </div>
        </Card>
        <Card className="flex flex-col">
          <GraduationCap size={22} className="text-primary-600 dark:text-primary-300" />
          <p className="mt-4 font-bold text-slate-800 dark:text-slate-100">Instituições de ensino</p>
          <p className="mt-1.5 flex-1 text-sm text-slate-500 dark:text-slate-400">Leve seus cursos para o catálogo da SkillBridge e amplie o alcance dos seus programas.</p>
          <div className="mt-5">
            <CtaLink to="/contato?assunto=parcerias" variant="secondary">
              Falar com o time
            </CtaLink>
          </div>
        </Card>
      </div>
    ),
  },
  ajuda: {
    eyebrow: 'Suporte',
    title: 'Central de ajuda',
    intro: 'Respostas rápidas para as dúvidas mais comuns de alunos, mentores e empresas.',
    body: (
      <div className="space-y-6">
        <div className="space-y-3">
          {faq.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-soft dark:border-slate-700/60 dark:bg-slate-800">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-800 dark:text-slate-100">
                {item.q}
                <ChevronDown size={18} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</div>
            </details>
          ))}
        </div>
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">Não encontrou o que procurava?</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mande sua dúvida para o nosso time de suporte.</p>
          </div>
          <CtaLink to="/contato?assunto=suporte">Falar com o suporte</CtaLink>
        </Card>
      </div>
    ),
  },
  contato: {
    eyebrow: 'Suporte',
    title: 'Fale com a gente',
    intro: 'Escolha o assunto e envie sua mensagem. Para dúvidas sobre um curso ou mentoria, o caminho mais rápido é o chat de Dúvidas dentro da plataforma.',
    body: (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>
        <div className="space-y-6">
          <Card>
            <p className="font-bold text-slate-800 dark:text-slate-100">Alunos e mentores</p>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Problemas de acesso, certificados ou agendamentos.</p>
            <a href={mailtoLink(SUPPORT_EMAIL, '[SkillBridge] Suporte')} className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">
              {SUPPORT_EMAIL}
            </a>
          </Card>
          <Card>
            <p className="font-bold text-slate-800 dark:text-slate-100">Empresas</p>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Treinamentos corporativos e propostas comerciais.</p>
            <a href={mailtoLink(SALES_EMAIL, '[SkillBridge] Empresas')} className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">
              {SALES_EMAIL}
            </a>
          </Card>
          <Card>
            <p className="font-bold text-slate-800 dark:text-slate-100">Respostas rápidas</p>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Talvez sua dúvida já esteja na Central de ajuda.</p>
            <Link to="/ajuda" className="mt-3 inline-block text-sm font-semibold text-primary-600 hover:underline dark:text-primary-300">
              Abrir a Central de ajuda
            </Link>
          </Card>
        </div>
      </div>
    ),
  },
  termos: {
    eyebrow: 'Documentos',
    title: 'Termos de uso',
    intro: `Última atualização: ${UPDATED_AT}. Ao criar uma conta ou usar a SkillBridge, você concorda com estes termos.`,
    body: (
      <Card className="space-y-6">
        <Section title="1. A plataforma">
          <p>A SkillBridge oferece cursos online, mentorias entre alunos e especialistas e um painel para empresas criarem treinamentos fechados para seus times.</p>
        </Section>
        <Section title="2. Contas">
          <p>
            Cada conta tem um único tipo (aluno, mentor ou empresa) e um e-mail exclusivo. Você é responsável por manter sua senha em segurança e pelas atividades
            realizadas com a sua conta.
          </p>
        </Section>
        <Section title="3. Conteúdo e certificados">
          <p>
            Os cursos são disponibilizados para uso pessoal e não podem ser redistribuídos. O certificado é emitido quando todas as aulas do curso são concluídas e
            comprova a conclusão do conteúdo na plataforma.
          </p>
        </Section>
        <Section title="4. Mentorias">
          <p>
            Sessões são agendadas nos horários publicados pelo mentor e podem ser canceladas antes da data. Pedimos respeito mútuo: conteúdos ofensivos ou uso
            indevido do chat podem levar à suspensão da conta.
          </p>
        </Section>
        <Section title="5. Empresas">
          <p>
            A empresa é responsável pelos treinamentos, cursos e vagas que publica e pela forma como vincula alunos e mentores aos seus programas. Conteúdos de um
            treinamento só ficam visíveis para quem está vinculado a ele.
          </p>
        </Section>
        <Section title="6. Contato">
          <p>
            Dúvidas sobre estes termos podem ser enviadas pela página de{' '}
            <Link to="/contato?assunto=outro" className="font-semibold text-primary-600 hover:underline dark:text-primary-300">
              contato
            </Link>
            .
          </p>
        </Section>
        <p className="border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-700/60">
          Texto de referência do protótipo: revise com o jurídico antes de publicar.
        </p>
      </Card>
    ),
  },
  privacidade: {
    eyebrow: 'Documentos',
    title: 'Política de privacidade',
    intro: `Última atualização: ${UPDATED_AT}. Explicamos quais dados tratamos, por quê e como você pode exercer seus direitos previstos na LGPD.`,
    body: (
      <Card className="space-y-6">
        <Section title="Dados que coletamos">
          <p>Nome, e-mail e senha (armazenada de forma criptografada); dados de perfil que você preencher; seu progresso em cursos, certificados, mentorias, atividades e mensagens.</p>
        </Section>
        <Section title="Para que usamos">
          <p>Para operar a plataforma: liberar cursos, registrar progresso, emitir certificados, agendar mentorias e permitir a comunicação entre alunos e mentores.</p>
        </Section>
        <Section title="Com quem compartilhamos">
          <p>
            Mentores veem os dados dos alunos com quem têm sessões. Empresas veem os dados e o progresso dos alunos vinculados aos seus treinamentos. Não vendemos
            dados pessoais.
          </p>
        </Section>
        <Section title="Seus direitos">
          <p>Você pode pedir acesso, correção ou exclusão dos seus dados e revogar consentimentos a qualquer momento pela página de contato.</p>
        </Section>
        <Section title="Segurança">
          <p>
            <ShieldCheck size={15} className="mr-1 inline text-emerald-500" />
            O acesso aos dados é controlado por regras no banco de dados: cada usuário só enxerga o que o seu tipo de conta e os seus vínculos permitem.
          </p>
        </Section>
        <p className="border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-700/60">
          Texto de referência do protótipo: revise com o jurídico/DPO antes de publicar.
        </p>
      </Card>
    ),
  },
}

export default function InfoPage({ slug }: { slug: InfoSlug }) {
  const page = pages[slug]

  // Navegar entre páginas institucionais pelo rodapé deve começar do topo.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-primary-100/70 dark:border-slate-800">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary-100 blur-3xl dark:bg-primary-500/10" />
        <div className="relative mx-auto max-w-5xl px-6 py-14">
          <span className="text-xs font-bold uppercase tracking-wide text-primary-500">{page.eyebrow}</span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-4xl">{page.title}</h1>
          <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">{page.intro}</p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-6 py-12">{page.body}</div>
    </PublicLayout>
  )
}
