import { LayoutDashboard, CalendarClock, Users, History, UserCircle, ClipboardList, MessageCircle } from 'lucide-react'
import { Sidebar, type SidebarItem } from './Sidebar'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { getUnreadMessages } from '../../lib/notifications'

const baseItems: SidebarItem[] = [
  { to: '/mentor', label: 'Agenda', icon: LayoutDashboard, end: true },
  { to: '/mentor/horarios', label: 'Horários Disponíveis', icon: CalendarClock },
  { to: '/mentor/alunos', label: 'Meus Alunos', icon: Users },
  { to: '/mentor/atividades', label: 'Atividades', icon: ClipboardList },
  { to: '/mentor/duvidas', label: 'Dúvidas', icon: MessageCircle },
  { to: '/mentor/historico', label: 'Histórico de Mentorias', icon: History },
  { to: '/mentor/perfil', label: 'Perfil Profissional', icon: UserCircle },
]

export function MentorSidebar() {
  const user = useAuthStore((s) => s.user)
  const messages = useDataStore((s) => s.mentorMessages)
  const activities = useDataStore((s) => s.mentorActivities)
  const unreadCount = getUnreadMessages(messages, user).length
  const toReviewCount = activities.filter((a) => a.mentorId === user?.id && a.status === 'entregue').length
  const badges: Record<string, number> = { '/mentor/duvidas': unreadCount, '/mentor/atividades': toReviewCount }
  const items = baseItems.map((item) => (badges[item.to] ? { ...item, badge: badges[item.to] } : item))

  return <Sidebar items={items} />
}
