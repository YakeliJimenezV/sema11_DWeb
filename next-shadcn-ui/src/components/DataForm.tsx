"use client"

import { Fragment, useId, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { es } from 'date-fns/locale'
import { Values, dateValue } from '@/lib/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export type Field = { key: string; label: string; section?: string; type?: 'email' | 'tel' | 'date' | 'select' | 'members' | 'switch'; optional?: boolean; maxDate?: Date; options?: { value: string; label: string }[] }
export function DataForm({ title, description, fields, initial, validate, onSave, onCancel, submitLabel = 'Guardar', columns = false }: {
  title?: string; description?: string; fields: Field[] | ((values: Values) => Field[]); initial: Values; validate: (values: Values) => string[]; onSave: (values: Values) => Promise<void>; onCancel?: () => void; submitLabel?: string; columns?: boolean
}) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const prefix = useId()
  const change = (key: string, value: string | boolean | string[]) => { setValues(previous => ({ ...previous, [key]: value, ...(key === 'projectId' ? { userId: '' } : {}) })); setSaved(false) }
  const formFields = typeof fields === 'function' ? fields(values) : fields
  return <form noValidate aria-busy={busy} onSubmit={async event => {
    event.preventDefault()
    if (busy) return
    const errors = validate(values)
    setErrors(errors)
    if (errors.length) return
    setBusy(true)
    try { await onSave(values); setSaved(true) } catch { setErrors(['No se pudo guardar. Inténtalo nuevamente.']) } finally { setBusy(false) }
  }} className="space-y-4">
    {title && <h3 className="font-semibold">{title}</h3>}
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
    {errors.length > 0 && <Alert variant="destructive" role="alert"><AlertTitle>Revisa los datos</AlertTitle><AlertDescription><ul>{errors.map(error => <li key={error}>{error}</li>)}</ul></AlertDescription></Alert>}
    {saved && <Alert role="status"><AlertTitle>Guardado</AlertTitle><AlertDescription>Los cambios se guardaron en memoria.</AlertDescription></Alert>}
    <fieldset disabled={busy} className={columns ? 'pk-form-grid' : 'space-y-4'}>
      {formFields.map(field => {
        const id = `${prefix}-${field.key}`
        const value = String(values[field.key] ?? '')
        const label = `${field.label}${field.optional ? '' : ' *'}`
        return <Fragment key={field.key}>{field.section && <h3 id={`settings-${field.key}`} className="pk-form-section">{field.section}</h3>}<div className="grid gap-2">
          {field.type === 'members' ? <fieldset className="space-y-2 rounded-md border p-3"><legend className="px-1 text-sm font-medium">{label}</legend>
            {!field.options?.length && <p className="text-sm text-muted-foreground">Primero agrega miembros en Equipo.</p>}
            {field.options?.map(option => <Label key={option.value} className="flex items-center gap-2"><Checkbox disabled={busy} checked={Array.isArray(values[field.key]) && (values[field.key] as string[]).includes(option.value)} onCheckedChange={checked => {
              const ids = Array.isArray(values[field.key]) ? values[field.key] as string[] : []
              change(field.key, checked === true ? [...ids, option.value] : ids.filter(id => id !== option.value))
            }} />{option.label}</Label>)}</fieldset>
          : <><Label htmlFor={id}>{label}</Label>
            {field.type === 'select' ? <Select disabled={busy} value={value || '_none'} onValueChange={value => change(field.key, value === '_none' ? '' : value)}><SelectTrigger id={id} className="w-full"><SelectValue placeholder="Selecciona una opción" /></SelectTrigger><SelectContent><SelectItem value="_none">{field.optional ? 'Sin proyecto' : 'Selecciona una opción'}</SelectItem>{field.options?.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
            : field.type === 'switch' ? <Switch id={id} disabled={busy} checked={values[field.key] === true} onCheckedChange={checked => change(field.key, checked)} />
            : field.type === 'date' ? <details className="rounded-md border p-2"><summary id={id} className="cursor-pointer text-sm">{value || 'Seleccionar fecha'}</summary><Calendar locale={es} mode="single" captionLayout="dropdown" startMonth={new Date(1900, 0)} endMonth={field.maxDate ?? new Date(2100, 11)} selected={value ? new Date(`${value}T12:00:00`) : undefined} defaultMonth={value ? new Date(`${value}T12:00:00`) : new Date()} disabled={busy ? true : field.maxDate ? { after: field.maxDate } : undefined} onSelect={date => change(field.key, date ? dateValue(date) : '')} /></details>
            : <Input id={id} type={field.type ?? 'text'} value={value} required={!field.optional} maxLength={field.type === 'tel' ? 20 : 300} onChange={event => change(field.key, event.target.value)} />}
          </>}
        </div></Fragment>
      })}
    </fieldset>
    <div className="flex justify-end gap-2">{onCancel && <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancelar</Button>}<Button type="submit" disabled={busy}>{busy && <Spinner aria-label="Guardando" />}{busy ? 'Guardando...' : submitLabel}</Button></div>
  </form>
}
export function FormDialog({ title, trigger, description = 'Completa los campos y guarda los cambios.', children, compact = false }: { title: string; trigger: string; description?: string; children: (close: () => void) => React.ReactNode; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const editing = trigger.startsWith('Editar')
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className={compact ? 'pk-icon-action' : editing ? 'pk-edit-button' : 'pk-primary-button'} variant={editing ? 'outline' : 'default'} size={compact ? 'icon' : 'default'} title={title} aria-label={title}>{editing ? <Pencil size={15} /> : <Plus size={17} />}{!compact && trigger}</Button></DialogTrigger><DialogContent className="pk-dialog max-h-[90vh] overflow-y-auto sm:max-w-[560px]" onInteractOutside={event => event.preventDefault()}><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>{open && children(() => setOpen(false))}</DialogContent></Dialog>
}
