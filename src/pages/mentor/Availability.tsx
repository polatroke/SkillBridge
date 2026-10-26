import { useState } from 'react'
import { Lock, Plus, Trash2 } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MentorSidebar } from '../../components/layout/MentorSidebar'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select, Input } from '../../components/ui/Field'
import { useAuthStore } from '../../store/authStore'
import { useCurrentMentor, useDataStore } from '../../store/dataStore'
import { friendlyError } from '../../lib/errors'
import type { Availability } from '../../types'

const weekdays: Availability['weekday'][] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function MentorAvailability() {
  const authUser = useAuthStore((s) => s.user)
  const mentor = useCurrentMentor(authUser?.id)
  const addAvailabilitySlot = useDataStore((s) => s.addAvailabilitySlot)
  const removeAvailabilitySlot = useDataStore((s) => s.removeAvailabilitySlot)

  const [weekday, setWeekday] = useState<Availability['weekday']>('Segunda')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  if (!mentor) return null

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setAdded(false)
    if (end <= start) {
      setError('O horário de fim precisa ser depois do início.')
      return
    }
    // Horários "HH:MM" comparam corretamente como texto.
    const overlap = mentor.availability.find((a) => a.weekday === weekday && start < a.end && a.start < end)
    if (overlap) {
      setError(`Esse período se sobrepõe ao horário de ${weekday} ${overlap.start}–${overlap.end}.`)
      return
    }
    setSaving(true)
    try {
      await addAvailabilitySlot(mentor.id, { weekday, start, end })
      setAdded(true)
    } catch (err) {
      setError(friendlyError(err, 'Não foi possível adicionar o horário. Tente novamente.'))
    } finally {
      setSaving(false)
    }
  }

  const removeSlot = async (id: string) => {
    setError(null)
    setAdded(false)
    setRemovingId(id)
    try {
      await removeAvailabilitySlot(id)
    } catch (err) {
      setError(friendlyError(err, 'Não foi possível remover o horário. Tente novamente.'))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <DashboardLayout sidebar={<MentorSidebar />} profileTitle="Painel do Mentor">
      <PageHeader title="Horários Disponíveis" description="Defina os horários em que você está disponível para mentorias. Alunos só podem agendar nesses períodos." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <p className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-100">Adicionar horário</p>
          <form className="space-y-4" onSubmit={addSlot}>
            <Select label="Dia da semana" value={weekday} onChange={(e) => setWeekday(e.target.value as Availability['weekday'])}>
              {weekdays.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Início" type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
              <Input label="Fim" type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
            </div>
            <Button type="submit" fullWidth icon={<Plus size={15} />} disabled={saving}>
              {saving ? 'Adicionando...' : 'Adicionar horário'}
            </Button>
            {error && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
            {added && <p className="text-sm font-semibold text-emerald-600">Horário adicionado!</p>}
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {weekdays.map((w) => {
            const slots = mentor.availability.filter((a) => a.weekday === w).sort((a, b) => a.start.localeCompare(b.start))
            if (slots.length === 0) return null
            return (
              <Card key={w}>
                <p className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">{w}</p>
                <div className="flex flex-wrap gap-2.5">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      title={slot.booked ? 'Reservado por uma sessão agendada: libera quando a sessão acontecer ou for cancelada' : undefined}
                      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold ${
                        slot.booked ? 'bg-slate-100 dark:bg-slate-700/60 text-slate-400' : 'bg-primary-50 dark:bg-primary-500/10 text-primary-700'
                      }`}
                    >
                      {slot.booked && <Lock size={13} aria-label="Reservado" />}
                      {slot.start}–{slot.end}
                      {!slot.booked && (
                        <button
                          onClick={() => removeSlot(slot.id)}
                          disabled={removingId === slot.id}
                          className="text-primary-400 hover:text-red-500 disabled:opacity-40"
                          aria-label={`Remover horário ${w} ${slot.start}–${slot.end}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
          {mentor.availability.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-400">
              Nenhum horário cadastrado ainda. Adicione horários para que alunos possam agendar mentorias com você.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
