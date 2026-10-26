import { useState } from 'react'
import { BookOpen, Plus, Search, SquarePen, Trash2, X } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { CompanySidebar } from '../../components/layout/CompanySidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Input, Select, Textarea } from '../../components/ui/Field'
import { MultiSelect } from '../../components/ui/MultiSelect'
import { CourseCover } from '../../components/ui/CourseCover'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import { CATEGORIES, parseLessons } from '../../lib/catalog'
import { friendlyError } from '../../lib/errors'
import { safeHttpUrl } from '../../lib/validation'
import type { Course, CourseStatus } from '../../types'

/**
 * Módulo em edição. As aulas ficam como texto livre (uma por linha) e só viram lista ao salvar:
 * antes o campo convertia a cada tecla e descartava a linha vazia, então o Enter "sumia" e não dava
 * para digitar a segunda aula.
 */
interface ModuleDraft {
  id: string
  title: string
  duration: string
  lessonsText: string
}

const emptyModule = (): ModuleDraft => ({ id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: '', duration: '', lessonsText: '' })

const blankForm = () => ({
  title: '',
  summary: '',
  category: CATEGORIES[0] as string,
  totalHours: 0,
  instructor: '',
  coverUrl: '',
  status: 'rascunho' as CourseStatus,
  programIds: [] as string[],
  modules: [emptyModule()],
})

export default function CoursesManagement() {
  const authUser = useAuthStore((s) => s.user)
  const companyId = authUser?.id ?? ''
  const courses = useDataStore((s) => s.courses)
  const allPrograms = useDataStore((s) => s.programs)
  const programs = allPrograms.filter((p) => p.companyId === companyId)
  const addCourse = useDataStore((s) => s.addCourse)
  const updateCourse = useDataStore((s) => s.updateCourse)
  const deleteCourse = useDataStore((s) => s.deleteCourse)

  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Course | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Course | null>(null)
  const [form, setForm] = useState(blankForm())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const companyCourses = courses.filter((c) => c.companyId === companyId).filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => {
    setEditing(null)
    setForm(blankForm())
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (course: Course) => {
    setEditing(course)
    setForm({
      title: course.title,
      summary: course.summary,
      category: course.category,
      totalHours: course.totalHours,
      instructor: course.instructor,
      coverUrl: course.coverUrl,
      status: course.status,
      programIds: course.programIds,
      modules: course.modules.length
        ? course.modules.map((m) => ({ id: m.id, title: m.title, duration: m.duration, lessonsText: m.lessons.join('\n') }))
        : [emptyModule()],
    })
    setFormError(null)
    setFormOpen(true)
  }

  const updateModule = (id: string, patch: Partial<ModuleDraft>) => {
    setForm((f) => ({ ...f, modules: f.modules.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const modules = form.modules
      .map((m) => ({ id: m.id, title: m.title.trim(), duration: m.duration.trim(), lessons: parseLessons(m.lessonsText) }))
      .filter((m) => m.title || m.lessons.length)
    const untitled = modules.findIndex((m) => !m.title)
    // Módulo sem título era descartado em silêncio, junto com as aulas digitadas nele.
    if (untitled >= 0) {
      setFormError(`Dê um título ao módulo ${untitled + 1} (ou apague as aulas dele).`)
      return
    }
    const hours = Math.round(Number(form.totalHours))
    if (!Number.isFinite(hours) || hours < 1) {
      setFormError('Informe a carga horária em horas inteiras (mínimo 1h): ela aparece no certificado.')
      return
    }
    if (!form.title.trim() || !form.summary.trim() || !form.instructor.trim()) {
      setFormError('Preencha título, resumo e instrutor.')
      return
    }
    // Curso publicado sem aulas aparecia no catálogo, aceitava matrícula e não tinha o que assistir.
    if (form.status === 'publicado' && !modules.some((m) => m.lessons.length > 0)) {
      setFormError('Adicione ao menos uma aula antes de publicar (ou salve como rascunho).')
      return
    }
    const coverUrl = form.coverUrl.trim()
    const safeCover = safeHttpUrl(coverUrl)
    if (coverUrl && !safeCover) {
      setFormError('A imagem de capa precisa ser um endereço http(s) válido.')
      return
    }
    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      category: form.category,
      totalHours: hours,
      instructor: form.instructor.trim(),
      // Sem capa fica vazio (o card mostra um placeholder). Antes gravava uma foto aleatória do picsum.
      coverUrl: safeCover ?? '',
      status: form.status,
      companyId,
      programIds: form.programIds,
      modules,
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editing) await updateCourse(editing.id, payload)
      else await addCourse(payload)
      setFormOpen(false)
    } catch (err) {
      setFormError(friendlyError(err, 'Não foi possível salvar o curso. Revise os campos e tente novamente.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout sidebar={<CompanySidebar />} profileTitle="Painel da Empresa">
      <PageHeader
        title="Gestão de Cursos"
        description="Crie, edite e remova os cursos exclusivos da sua empresa. Eles só ficam visíveis para alunos dos treinamentos vinculados."
        actions={
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            Novo curso
          </Button>
        }
      />

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar curso..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {companyCourses.map((course) => (
          <Card key={course.id} padding="none" className="overflow-hidden">
            <CourseCover coverUrl={course.coverUrl} title={course.title} className="h-32 w-full" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-primary-500">{course.category}</span>
                <Badge status={course.status === 'publicado' ? 'publicado' : 'rascunho'} />
              </div>
              <h3 className="mt-1.5 line-clamp-2 text-sm font-bold text-slate-800 dark:text-slate-100">{course.title}</h3>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <BookOpen size={13} /> {course.enrolledCount} alunos matriculados
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {programs
                  .filter((p) => course.programIds.includes(p.id))
                  .map((p) => (
                    <span key={p.id} className="rounded-full bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 text-xs font-semibold text-primary-600">
                      {p.name}
                    </span>
                  ))}
                {course.programIds.length === 0 && <span className="text-xs text-slate-400">Sem treinamento vinculado</span>}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700/60 pt-3.5">
                <Button variant="secondary" size="sm" icon={<SquarePen size={13} />} onClick={() => openEdit(course)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setToDelete(course)}>
                  Remover
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {companyCourses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-400">
          Nenhum curso cadastrado ainda. Clique em "Novo curso" para começar.
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar curso' : 'Novo curso'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="course-form" disabled={saving}>
              {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar curso'}
            </Button>
          </>
        }
      >
        <form id="course-form" className="space-y-5" onSubmit={handleSubmit}>
          <Input label="Título do curso" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          <Textarea
            label="Descrição / resumo"
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select label="Categoria / área" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input
              label="Carga horária total (h)"
              type="number"
              min={1}
              step={1}
              required
              value={form.totalHours || ''}
              onChange={(e) => setForm((f) => ({ ...f, totalHours: Number(e.target.value) }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Instrutor responsável"
              value={form.instructor}
              onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))}
              placeholder="Nome do instrutor ou mentor"
              required
            />
            <Input
              label="Imagem de capa (URL)"
              type="url"
              value={form.coverUrl}
              onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Módulos</span>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, modules: [...f.modules, emptyModule()] }))}
                className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline"
              >
                <Plus size={13} /> Adicionar módulo
              </button>
            </div>
            <div className="space-y-3">
              {form.modules.map((mod, idx) => (
                <div key={mod.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5">
                  <div className="flex items-start gap-2">
                    <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-500/10 text-xs font-bold text-primary-600">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <input
                          aria-label={`Título do módulo ${idx + 1}`}
                          className="rounded-lg sm:col-span-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
                          placeholder="Título do módulo"
                          value={mod.title}
                          onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                        />
                        <input
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
                          aria-label={`Duração do módulo ${idx + 1}`}
                          placeholder="Duração (ex: 4h)"
                          value={mod.duration}
                          onChange={(e) => updateModule(mod.id, { duration: e.target.value })}
                        />
                      </div>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
                        aria-label={`Aulas do módulo ${idx + 1}`}
                        placeholder="Aulas (uma por linha)"
                        rows={3}
                        value={mod.lessonsText}
                        onChange={(e) => updateModule(mod.id, { lessonsText: e.target.value })}
                      />
                      <p className="text-xs text-slate-400">{parseLessons(mod.lessonsText).length} aula(s)</p>
                    </div>
                    {form.modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, modules: f.modules.filter((m) => m.id !== mod.id) }))}
                        className="mt-2 shrink-0 text-slate-300 hover:text-red-500"
                        aria-label={`Remover módulo ${idx + 1}`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <MultiSelect
            label="Treinamento(s) vinculado(s)"
            options={programs.map((p) => ({ id: p.id, label: p.name }))}
            selected={form.programIds}
            onChange={(ids) => setForm((f) => ({ ...f, programIds: ids }))}
            hint="O curso só fica visível para alunos matriculados nesses treinamentos."
            emptyLabel="Crie um treinamento primeiro em Gestão de Treinamentos."
          />

          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CourseStatus }))}>
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </Select>
          {formError && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await deleteCourse(toDelete.id)
        }}
        title={`Remover "${toDelete?.title}"?`}
        description="O curso deixará de aparecer para os alunos imediatamente."
        confirmLabel="Remover"
        danger
      >
        {!!toDelete?.enrolledCount && (
          // A exclusão apaga em cascata matrículas, progresso por aula e certificados já emitidos.
          <p className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            {toDelete.enrolledCount} aluno(s) matriculado(s) perderão o acesso, o progresso e os certificados deste curso. Para só tirar o curso do ar,
            edite e salve como Rascunho.
          </p>
        )}
      </ConfirmDialog>
    </DashboardLayout>
  )
}
