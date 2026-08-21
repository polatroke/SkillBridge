import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { useAuthStore } from '../../store/authStore'

const accountTypeLabel = { student: 'Aluno', mentor: 'Mentor', company: 'Empresa' } as const

const notificationsByType: Record<string, string[]> = {
  student: ['Sua mentoria com Beatriz Lima foi confirmada', 'Novo módulo liberado em Python para Análise de Dados', 'Certificado emitido: Fundamentos de UX Design'],
  mentor: ['Novo agendamento de mentoria com Rafael Nogueira', 'Você recebeu uma avaliação 5 estrelas', 'Lembrete: sessão às 16h de hoje'],
  company: ['Nova solicitação de acesso ao treinamento', '3 alunos concluíram o Onboarding TechNova', 'Convite de mentor pendente há 5 dias'],
}

export function Topbar({ profileTitle }: { profileTitle: string }) {
  const { user, accountType, logout } = useAuthStore()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const notifications = notificationsByType[accountType ?? ''] ?? []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const profilePath = accountType === 'student' ? '/aluno/perfil' : accountType === 'mentor' ? '/mentor/perfil' : '/empresa/configuracoes'

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/90 px-6 backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-400">{profileTitle}</p>
        <p className="text-sm font-bold text-slate-800">Bem-vindo(a) de volta, {user?.name.split(' ')[0]}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v)
              setMenuOpen(false)
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Notificações"
          >
            <Bell size={19} />
            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cta ring-2 ring-white" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-2 shadow-card">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">Notificações</p>
              {notifications.map((n, i) => (
                <div key={i} className="rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-primary-50/60">
                  {n}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setMenuOpen((v) => !v)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
          >
            <Avatar name={user?.name ?? '?'} size="sm" />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-slate-800">{user?.name}</span>
              <span className="block text-xs leading-tight text-slate-400">{accountType && accountTypeLabel[accountType]}</span>
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-card">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate(profilePath)
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-primary-50/60"
              >
                <User size={16} /> Meu perfil
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
