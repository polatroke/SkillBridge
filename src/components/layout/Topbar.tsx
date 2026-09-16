import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { getUnreadMessages, senderNameFor, threadLinkFor } from '../../lib/notifications'
import { formatDateTimeBR } from '../../lib/date'

const accountTypeLabel = { student: 'Aluno', mentor: 'Mentor', company: 'Empresa' } as const

export function Topbar({ profileTitle }: { profileTitle: string }) {
  const { user, accountType, logout } = useAuthStore()
  const messages = useDataStore((s) => s.mentorMessages)
  const mentors = useDataStore((s) => s.mentors)
  const students = useDataStore((s) => s.students)
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const unread = getUnreadMessages(messages, user).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const goToNotification = (link: string) => {
    setNotifOpen(false)
    navigate(link)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const profilePath = accountType === 'student' ? '/aluno/perfil' : accountType === 'mentor' ? '/mentor/perfil' : '/empresa/configuracoes'

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/90 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-400">{profileTitle}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Bem-vindo(a) de volta, {user?.name.split(' ')[0]}</p>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v)
              setMenuOpen(false)
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Notificações"
          >
            <Bell size={19} />
            {unread.length > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cta px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unread.length > 9 ? '9+' : unread.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-2 shadow-card dark:border-slate-700/60 dark:bg-slate-800">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">Notificações</p>
              {user &&
                unread.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => goToNotification(threadLinkFor(m, user))}
                    className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-primary-50/60 dark:text-slate-300 dark:hover:bg-primary-500/10"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{senderNameFor(m, user, mentors, students)}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{m.body}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{formatDateTimeBR(m.createdAt)}</span>
                  </button>
                ))}
              {unread.length === 0 && <p className="px-3 py-4 text-center text-sm text-slate-400">Nenhuma notificação por aqui.</p>}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setMenuOpen((v) => !v)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Avatar name={user?.name ?? '?'} size="sm" />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-slate-800 dark:text-slate-100">{user?.name}</span>
              <span className="block text-xs leading-tight text-slate-400">{accountType && accountTypeLabel[accountType]}</span>
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-card dark:border-slate-700/60 dark:bg-slate-800">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate(profilePath)
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-primary-50/60 dark:text-slate-300 dark:hover:bg-primary-500/10"
              >
                <User size={16} /> Meu perfil
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
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
