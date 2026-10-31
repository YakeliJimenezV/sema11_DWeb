"use client"
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Action } from '@/lib/dashboard'
import { useDashboard } from '@/components/DashboardProvider'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
export function DeleteDialog({ title, description, action, compact = false }: { title: string; description: string; action: Action; compact?: boolean }) {
  const { commit } = useDashboard()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  return <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value) }}><DialogTrigger asChild><Button className={compact ? 'pk-icon-action pk-danger-action' : ''} variant={compact ? 'ghost' : 'destructive'} size={compact ? 'icon' : 'sm'} title={title} aria-label={title}><Trash2 size={15} />{!compact && 'Eliminar'}</Button></DialogTrigger><DialogContent className="pk-dialog"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancelar</Button><Button variant="destructive" disabled={busy} onClick={async () => { setBusy(true); try { await commit(action); setOpen(false) } finally { setBusy(false) } }}>{busy && <Spinner aria-label="Eliminando" />}Confirmar eliminación</Button></DialogFooter></DialogContent></Dialog>
}
