"use client"
import { DataForm, Field, FormDialog } from '@/components/DataForm'
import { useDashboard } from '@/components/DashboardProvider'
import { Project, Member, Task, Values, categories, priorities, statuses, validate } from '@/lib/dashboard'
const options = (values: string[]) => values.map(value => ({ value, label: value }))
function EntityForm({ kind, initial, id, compact = false }: { kind: 'project' | 'member' | 'task'; initial: Values; id?: string; compact?: boolean }) {
  const { state, commit } = useDashboard()
  const entity = kind === 'project' ? 'Proyecto' : kind === 'member' ? 'miembro' : 'tarea'
  const title = id ? `Editar ${entity}` : kind === 'project' ? 'Nuevo Proyecto' : `Nuev${kind === 'member' ? 'o' : 'a'} ${entity}`
  const projects = state.projects.map(p => ({ value: p.id, label: p.name }))
  const fields = (values: Values): Field[] => kind === 'project' ? [
    { key: 'name', label: 'Nombre del Proyecto' }, { key: 'description', label: 'Descripción' },
    { key: 'category', label: 'Categoría', type: 'select', options: options(categories) },
    { key: 'priority', label: 'Prioridad', type: 'select', options: options(priorities) },
    { key: 'memberIds', label: 'Miembros del equipo', type: 'members', options: state.members.map(m => ({ value: m.userId, label: `${m.name} · ${state.projects.find(p => p.id === m.projectId)?.name ?? 'Sin proyecto'}` })) },
  ] : kind === 'member' ? [
    { key: 'name', label: 'Nombre completo' }, { key: 'role', label: 'Rol' }, { key: 'email', label: 'Correo electrónico', type: 'email' },
    { key: 'position', label: 'Puesto' }, { key: 'birthdate', label: 'Fecha de nacimiento', type: 'date', maxDate: new Date() },
    { key: 'phone', label: 'Teléfono', type: 'tel' }, { key: 'projectId', label: 'Proyecto', type: 'select', optional: true, options: projects },
    { key: 'isActive', label: 'Activo', type: 'switch', optional: true },
  ] : [
    { key: 'description', label: 'Descripción' }, { key: 'projectId', label: 'Proyecto', type: 'select', options: projects },
    { key: 'status', label: 'Estado', type: 'select', options: options(statuses) }, { key: 'priority', label: 'Prioridad', type: 'select', options: options(priorities) },
    { key: 'userId', label: 'Responsable', type: 'select', options: state.members.filter(m => m.projectId === values.projectId).map(m => ({ value: m.userId, label: `${m.name}${m.isActive ? '' : ' (inactivo)'}` })) },
    { key: 'dateline', label: 'Fecha límite', type: 'date' },
  ]
  return <FormDialog title={title} trigger={title} compact={compact} description={kind === 'project' ? 'Selecciona los miembros del proyecto. Cada miembro pertenece a un proyecto; seleccionarlo aquí lo reasigna.' : 'Completa los campos y guarda los cambios.'}>{close => <>
    {kind === 'member' && <p className="text-xs text-muted-foreground">ID: {id ?? 'Se asignará al guardar'}</p>}
    <DataForm initial={initial} fields={fields} validate={values => validate(kind, values, state, id)} onCancel={close} submitLabel={id ? 'Guardar cambios' : `Crear ${entity}`} onSave={async values => {
      const text = (key: string) => String(values[key] ?? '').trim()
      const recordId = id ?? crypto.randomUUID()
      if (kind === 'project') await commit({ type: 'project', value: { id: recordId, name: text('name'), description: text('description'), category: text('category'), priority: text('priority') }, memberIds: values.memberIds as string[] })
      else if (kind === 'member') await commit({ type: 'member', value: { userId: recordId, name: text('name'), role: text('role'), email: text('email'), position: text('position'), birthdate: text('birthdate'), phone: text('phone'), projectId: text('projectId'), isActive: values.isActive === true } })
      else await commit({ type: 'task', value: { id: recordId, description: text('description'), projectId: text('projectId'), status: text('status'), priority: text('priority'), userId: text('userId'), dateline: text('dateline') } })
      close()
    }} /></>}</FormDialog>
}
export function ProjectForm({ project, compact }: { project?: Project; compact?: boolean }) {
  const { state } = useDashboard()
  return <EntityForm kind="project" id={project?.id} compact={compact} initial={{ name: '', description: '', category: '', priority: '', ...project, memberIds: project ? state.members.filter(m => m.projectId === project.id).map(m => m.userId) : [] }} />
}
export function MemberForm({ member, compact }: { member?: Member; compact?: boolean }) { return <EntityForm kind="member" id={member?.userId} compact={compact} initial={{ name: '', role: '', email: '', position: '', birthdate: '', phone: '', projectId: '', isActive: true, ...member }} /> }
export function TaskForm({ task, compact }: { task?: Task; compact?: boolean }) { return <EntityForm kind="task" id={task?.id} compact={compact} initial={{ description: '', projectId: '', status: 'Pendiente', priority: 'Media', userId: '', dateline: '', ...task }} /> }
