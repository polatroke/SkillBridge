import { LayoutDashboard, Users, GraduationCap, BookOpen, FolderKanban, Briefcase, BarChart3, Settings } from 'lucide-react'
import { Sidebar, type SidebarItem } from './Sidebar'

const items: SidebarItem[] = [
  { to: '/empresa', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/empresa/alunos', label: 'Gestão de Alunos', icon: Users },
  { to: '/empresa/mentores', label: 'Gestão de Mentores', icon: GraduationCap },
  { to: '/empresa/cursos', label: 'Gestão de Cursos', icon: BookOpen },
  { to: '/empresa/treinamentos', label: 'Gestão de Treinamentos', icon: FolderKanban },
  { to: '/empresa/vagas', label: 'Vagas Internas', icon: Briefcase },
  { to: '/empresa/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/empresa/configuracoes', label: 'Configurações', icon: Settings },
]

export function CompanySidebar() {
  return <Sidebar items={items} />
}
