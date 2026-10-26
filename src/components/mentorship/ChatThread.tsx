import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { cn } from '../../lib/cn'
import { formatDateTimeBR } from '../../lib/date'
import { friendlyError } from '../../lib/errors'
import type { MentorMessage } from '../../types'

interface ChatThreadProps {
  messages: MentorMessage[]
  currentUserId: string
  otherName: string
  onSend: (body: string) => void | Promise<void>
}

/**
 * Thread de chat compartilhada entre o painel do mentor (Dúvidas) e o do
 * aluno (Minhas dúvidas) — mesma renderização de bolhas e caixa de envio.
 */
export function ChatThread({ messages, currentUserId, otherName, onSend }: ChatThreadProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    setError(null)
    try {
      await onSend(body)
      setDraft('')
    } catch (err) {
      // Antes a falha não aparecia: a mensagem ficava no campo sem nenhum aviso.
      setError(friendlyError(err, 'Não foi possível enviar a mensagem. Tente novamente.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 && (
          <EmptyState title="Nenhuma mensagem ainda" description={`Envie a primeira mensagem para ${otherName}.`} />
        )}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                  mine
                    ? 'rounded-br-md bg-primary text-white'
                    : 'rounded-bl-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={cn('mt-1 text-[10px]', mine ? 'text-primary-100' : 'text-slate-400 dark:text-slate-500')}>
                  {formatDateTimeBR(m.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
      <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-700/60">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label={`Mensagem para ${otherName}`}
          maxLength={2000}
          placeholder={`Escreva uma mensagem para ${otherName}...`}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
        />
        <Button type="submit" icon={<Send size={15} />} disabled={!draft.trim() || sending}>
          Enviar
        </Button>
      </form>
    </div>
  )
}
