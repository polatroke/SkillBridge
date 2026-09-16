import { LayoutDashboard, BookOpen, Users, MessageCircle, Briefcase, UserCircle } from 'lucide-react'
import { Sidebar, type SidebarItem } from './Sidebar'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { getUnreadMessages } from '../../lib/notifications'

const baseItems: SidebarItem[] = [
  { to: '/aluno', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/aluno/cursos', label: 'Explorar Cursos', icon: BookOpen },
  { to: '/aluno/mentoria', label: 'Mentoria', icon: Users },
  { to: '/aluno/duvidas', label: 'Dúvidas', icon: MessageCircle },
  { to: '/aluno/vagas', label: 'Vagas', icon: Briefcase },
  { to: '/aluno/perfil', label: 'Perfil', icon: UserCircle },
]

export function StudentSidebar() {
  const { user } = useAuthStore()
  const liveStudent = useDataStore((s) => s.students.find((x) => x.id === user?.id))
  const programs = useDataStore((s) => s.programs)
  const messages = useDataStore((s) => s.mentorMessages)
  const activeProgram = liveStudent?.programId ? programs.find((p) => p.id === liveStudent.programId) : undefined
  const unreadCount = getUnreadMessages(messages, user).length
  const items = baseItems.map((item) => (item.to === '/aluno/duvidas' ? { ...item, badge: unreadCount } : item))

  return (
    <Sidebar
      items={items}
      footer={
        activeProgram ? (
          <div className="rounded-xl bg-primary-50 p-3.5 dark:bg-primary-500/10">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary-500 dark:text-primary-400">Treinamento ativo</p>
            <p className="mt-1 text-sm font-bold text-primary-800 dark:text-primary-300">{activeProgram.name}</p>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Você ainda não está em nenhum treinamento de empresa.</p>
          </div>
        )
      }
    />
  )
}
