import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AtSign, Check, MessageCircle, Rss, Share2 } from 'lucide-react'
import logo from '../../assets/logo.svg'

const columns = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Explorar cursos', to: '/#cursos' },
      { label: 'Mentoria', to: '/#mentoria' },
      { label: 'Para empresas', to: '/#empresas' },
      { label: 'Preços', to: '/precos' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { label: 'Sobre a SkillBridge', to: '/sobre' },
      { label: 'Carreiras', to: '/carreiras' },
      { label: 'Imprensa', to: '/imprensa' },
      { label: 'Parceiros', to: '/parceiros' },
    ],
  },
  {
    title: 'Suporte',
    links: [
      { label: 'Central de ajuda', to: '/ajuda' },
      { label: 'Contato', to: '/contato' },
      { label: 'Termos de uso', to: '/termos' },
      { label: 'Privacidade', to: '/privacidade' },
    ],
  },
]

const iconClass =
  'flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors hover:bg-primary hover:text-white dark:bg-primary-500/10 dark:text-primary-300'

/** Compartilha o site (menu nativo no celular) ou, sem suporte, copia o link. */
function ShareButton() {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.origin
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SkillBridge', text: 'Cursos, mentoria e oportunidades em um só lugar.', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* compartilhamento cancelado pelo usuário */
    }
  }

  return (
    <button type="button" onClick={share} aria-label="Compartilhar a SkillBridge" title={copied ? 'Link copiado!' : 'Compartilhar'} className={iconClass}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
    </button>
  )
}

const socialLinks = [
  { icon: AtSign, label: 'Fale conosco', to: '/contato' },
  { icon: MessageCircle, label: 'Central de ajuda', to: '/ajuda' },
  { icon: Rss, label: 'Novidades', to: '/imprensa' },
]

export function Footer() {
  return (
    <footer className="w-full border-t border-primary-100/70 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-9 w-auto" />
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-50">SkillBridge</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              A ponte entre aprendizado, mentoria e oportunidades reais de carreira — para pessoas e empresas.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, to }) => (
                <Link key={to} to={to} aria-label={label} title={label} className={iconClass}>
                  <Icon size={16} />
                </Link>
              ))}
              <ShareButton />
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-50">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row dark:border-slate-800">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} SkillBridge Tecnologia Educacional Ltda. Todos os direitos reservados.</p>
          <p className="text-xs text-slate-400">Protótipo de alta fidelidade · dados fictícios para demonstração</p>
        </div>
      </div>
    </footer>
  )
}
