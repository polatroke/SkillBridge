import { useState, type ReactNode } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { friendlyError } from '../../lib/errors'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  /** Pode ser assíncrona: o diálogo espera terminar e só fecha se der certo. */
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  confirmLabel?: string
  danger?: boolean
  /** Conteúdo extra no corpo (ex: aviso de que alunos perdem o acesso). */
  children?: ReactNode
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', danger, children }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    if (busy) return
    setError(null)
    onClose()
  }

  const handleConfirm = async () => {
    setBusy(true)
    setError(null)
    try {
      await onConfirm()
      setBusy(false)
      onClose()
    } catch (err) {
      setBusy(false)
      setError(friendlyError(err, 'Não foi possível concluir a ação. Tente novamente.'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={busy}>
            Cancelar
          </Button>
          <Button variant={danger ? 'destructive' : 'primary'} onClick={handleConfirm} disabled={busy}>
            {busy ? 'Aguarde...' : confirmLabel}
          </Button>
        </>
      }
    >
      {children}
      {danger && <p className="text-sm text-slate-500 dark:text-slate-400">Essa ação não poderá ser desfeita.</p>}
      {error && <p className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
    </Modal>
  )
}
