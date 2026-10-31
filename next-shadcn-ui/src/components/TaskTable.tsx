"use client"

import { useState } from 'react'
import { Search } from 'lucide-react'
import { paginate, priorities, statuses } from '@/lib/dashboard'
import { useDashboard } from '@/components/DashboardProvider'
import { TaskForm } from '@/components/ProjectForm'
import { DeleteDialog } from '@/components/DeleteDialog'
import { FilterSelect, PageControls, PersonAvatar, Pill, formatDate, matchesSearch } from '@/components/DashboardVisuals'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

export function TasksTable({ search = '' }: { search?: string }) {
  const { state } = useDashboard()
  const [requestedPage, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [project, setProject] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const filtered = state.tasks.filter(task => (!project || project === task.projectId) && (!status || status === task.status) && (!priority || priority === task.priority) && matchesSearch(query, task.description) && matchesSearch(search, task.description, state.projects.find(p => p.id === task.projectId)?.name ?? '', state.members.find(m => m.userId === task.userId)?.name ?? ''))
  const { pages, page, items: tasks } = paginate(filtered, requestedPage, Number(state.settings.pageSize))
  const allSelected = tasks.length > 0 && tasks.every(task => selected.includes(task.id))
  return <section className="pk-panel pk-data-panel"><div className="pk-table-toolbar pk-task-filters"><div className="pk-search-input"><Search size={17} /><input aria-label="Buscar tarea" placeholder="Buscar tarea..." value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} /></div><FilterSelect label="Todos los proyectos" value={project} onChange={value => { setProject(value); setPage(1) }} options={state.projects.map(p => ({ value: p.id, label: p.name }))} /><FilterSelect label="Todos los estados" value={status} onChange={value => { setStatus(value); setPage(1) }} options={statuses.map(value => ({ value, label: value }))} /><FilterSelect label="Todas las prioridades" value={priority} onChange={value => { setPriority(value); setPage(1) }} options={priorities.map(value => ({ value, label: value }))} /></div>
    <div className="pk-table-scroll"><Table className="pk-table"><TableCaption className="sr-only">Tareas del equipo con filtros y paginación</TableCaption><TableHeader><TableRow><TableHead className="pk-checkbox-cell"><Checkbox aria-label="Seleccionar tareas de esta página" checked={allSelected ? true : tasks.some(t => selected.includes(t.id)) ? 'indeterminate' : false} onCheckedChange={checked => setSelected(previous => checked === true ? [...new Set([...previous, ...tasks.map(t => t.id)])] : previous.filter(id => !tasks.some(t => t.id === id)))} /></TableHead>{['Tarea', 'Proyecto', 'Estado', 'Prioridad', 'Asignado a', 'Fecha límite', 'Acciones'].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{tasks.map(task => {
      const member = state.members.find(m => m.userId === task.userId)
      return <TableRow key={task.id} data-selected={selected.includes(task.id)}><TableCell className="pk-checkbox-cell"><Checkbox aria-label={`Seleccionar ${task.description}`} checked={selected.includes(task.id)} onCheckedChange={checked => setSelected(previous => checked === true ? [...previous, task.id] : previous.filter(id => id !== task.id))} /></TableCell><TableCell className="pk-task-name">{task.description}</TableCell><TableCell>{state.projects.find(p => p.id === task.projectId)?.name ?? 'Sin proyecto'}</TableCell><TableCell><Pill text={task.status} /></TableCell><TableCell><Pill text={task.priority} /></TableCell><TableCell>{member ? <div className="pk-assignee"><PersonAvatar name={member.name} index={state.members.indexOf(member)} small /><span>{member.name}</span></div> : <span className="pk-muted">Sin asignar</span>}</TableCell><TableCell className="pk-date-cell">{formatDate(task.dateline)}</TableCell><TableCell><div className="pk-actions"><TaskForm task={task} compact /><DeleteDialog compact title={`Eliminar ${task.description}`} description="Se eliminará esta tarea del proyecto." action={{ type: 'deleteTask', id: task.id }} /></div></TableCell></TableRow>
    })}{tasks.length === 0 && <TableRow><TableCell colSpan={8} className="pk-empty">No hay tareas que coincidan con los filtros.</TableCell></TableRow>}</TableBody></Table></div><PageControls page={page} pages={pages} total={filtered.length} onChange={setPage} noun="tareas" />
  </section>
}
