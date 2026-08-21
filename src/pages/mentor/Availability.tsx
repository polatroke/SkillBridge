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
import type { Availability } from '../../types'

const weekdays: Availability['weekday'][] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function MentorAvailability() {
  const authUser = useAuthStore((s) => s.user)
  const mentor = useCurrentMentor(authUser?.id)
  const setMentorAvailability = useDataStore((s) => s.setMentorAvailability)

  const [weekday, setWeekday] = useState<Availability['weekday']>('Segunda')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')

  if (!mentor) return null

  const addSlot = (e: React.FormEvent) => {
    e.preventDefault()
    const newSlot: Availability = { id: `av-${Date.now()}`, weekday, start, end }
    setMentorAvailability(mentor.id, [...mentor.availability, newSlot])
  }

  const removeSlot = (id: string) => {
    setMentorAvailability(
      mentor.id,
      mentor.availability.filter((a) => a.id !== id)
    )
  }

  return (
    <DashboardLayout sidebar={<MentorSidebar />} profileTitle="Painel do Mentor">
      <PageHeader title="Horários Disponíveis" description="Defina os horários em que você está disponível para mentorias. Alunos só podem agendar nesses períodos." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <p className="mb-4 text-sm font-bold text-slate-800">Adicionar horário</p>
          <form className="space-y-4" onSubmit={addSlot}>
            <Select label="Dia da semana" value={weekday} onChange={(e) => setWeekday(e.target.value as Availability['weekday'])}>
              {weekdays.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Início" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              <Input label="Fim" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <Button type="submit" fullWidth icon={<Plus size={15} />}>
              Adicionar horário
            </Button>
          </form>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          {weekdays.map((w) => {
            const slots = mentor.availability.filter((a) => a.weekday === w)
            if (slots.length === 0) return null
            return (
              <Card key={w}>
                <p className="mb-3 text-sm font-bold text-slate-800">{w}</p>
                <div className="flex flex-wrap gap-2.5">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold ${
                        slot.booked ? 'bg-slate-100 text-slate-400' : 'bg-primary-50 text-primary-700'
                      }`}
                    >
                      {slot.booked && <Lock size={13} />}
                      {slot.start}–{slot.end}
                      {!slot.booked && (
                        <button onClick={() => removeSlot(slot.id)} className="text-primary-400 hover:text-red-500" aria-label="Remover horário">
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
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
              Nenhum horário cadastrado ainda. Adicione horários para que alunos possam agendar mentorias com você.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
