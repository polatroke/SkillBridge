interface Option {
  id: string
  label: string
}

interface MultiSelectProps {
  label?: string
  options: Option[]
  selected: string[]
  onChange: (ids: string[]) => void
  hint?: string
  emptyLabel?: string
}

export function MultiSelect({ label, options, selected, onChange, hint, emptyLabel = 'Nenhuma opção disponível.' }: MultiSelectProps) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
        {options.length === 0 && <p className="px-2 py-1.5 text-sm text-slate-400">{emptyLabel}</p>}
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-primary-50/60"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.id)}
              onChange={() => toggle(opt.id)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary-300"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </div>
  )
}
