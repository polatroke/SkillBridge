import { Link } from 'react-router-dom'
import { AtSign, GraduationCap, MessageCircle, Rss, Share2 } from 'lucide-react'

const columns = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Explorar cursos', to: '/' },
      { label: 'Mentoria', to: '/' },
      { label: 'Para empresas', to: '/' },
      { label: 'Preços', to: '/' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { label: 'Sobre a SkillBridge', to: '/' },
      { label: 'Carreiras', to: '/' },
      { label: 'Imprensa', to: '/' },
      { label: 'Parceiros', to: '/' },
    ],
  },
  {
    title: 'Suporte',
    links: [
      { label: 'Central de ajuda', to: '/' },
      { label: 'Contato', to: '/' },
      { label: 'Termos de uso', to: '/' },
      { label: 'Privacidade', to: '/' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="w-full border-t border-primary-100/70 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                <GraduationCap size={20} />
              </div>
              <span className="text-lg font-extrabold text-slate-900">SkillBridge</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              A ponte entre aprendizado, mentoria e oportunidades reais de carreira — para pessoas e empresas.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[AtSign, Share2, MessageCircle, Rss].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Rede social"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors hover:bg-primary hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-slate-900">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-slate-500 transition-colors hover:text-primary-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} SkillBridge Tecnologia Educacional Ltda. Todos os direitos reservados.</p>
          <p className="text-xs text-slate-400">Protótipo de alta fidelidade · dados fictícios para demonstração</p>
        </div>
      </div>
    </footer>
  )
}
