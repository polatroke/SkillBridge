import { LayoutDashboard, BookOpen, Users, Briefcase, UserCircle } from 'lucide-react'
import { Sidebar, type SidebarItem } from './Sidebar'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'

const items: SidebarItem[] = [
  { to: '/aluno', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/aluno/cursos', label: 'Explorar Cursos', icon: BookOpen },
  { to: '/aluno/mentoria', label: 'Mentoria', icon: Users },
  { to: '/aluno/vagas', label: 'Vagas', icon: Briefcase },
  { to: '/aluno/perfil', label: 'Perfil', icon: UserCircle },
]

export function StudentSidebar() {
  const { user } = useAuthStore()
  const liveStudent = useDataStore((s) => s.students.find((x) => x.id === user?.id))
  const programs = useDataStore((s) => s.programs)
  const activeProgram = liveStudent?.programId ? programs.find((p) => p.id === liveStudent.programId) : undefined

  return (
    <Sidebar
      items={items}
      footer={
        activeProgram ? (
          <div className="rounded-xl bg-primary-50 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary-500">Treinamento ativo</p>
            <p className="mt-1 text-sm font-bold text-primary-800">{activeProgram.name}</p>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-3.5">
            <p className="text-xs font-semibold text-slate-500">Você ainda não está em nenhum treinamento de empresa.</p>
          </div>
        )
      }
    />
  )
}
