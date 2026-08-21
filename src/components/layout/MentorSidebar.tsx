import { LayoutDashboard, CalendarClock, Users, History, UserCircle } from 'lucide-react'
import { Sidebar, type SidebarItem } from './Sidebar'

const items: SidebarItem[] = [
  { to: '/mentor', label: 'Agenda', icon: LayoutDashboard, end: true },
  { to: '/mentor/horarios', label: 'Horários Disponíveis', icon: CalendarClock },
  { to: '/mentor/alunos', label: 'Meus Alunos', icon: Users },
  { to: '/mentor/historico', label: 'Histórico de Mentorias', icon: History },
  { to: '/mentor/perfil', label: 'Perfil Profissional', icon: UserCircle },
]

export function MentorSidebar() {
  return <Sidebar items={items} />
}
