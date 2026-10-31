"use client"

import { useState } from 'react'
import { es } from 'date-fns/locale'
import { Activity, CalendarDays, CheckCheck, CheckCircle2, Clock3, Eye, Folder, Layers3, LayoutDashboard, ListTodo, Search, Settings2, Users } from 'lucide-react'
import { useDashboard } from '@/components/DashboardProvider'
import { DataForm } from '@/components/DataForm'
import { ProjectForm, MemberForm } from '@/components/ProjectForm'
import { DeleteDialog } from '@/components/DeleteDialog'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Panel, Pill, PersonAvatar, ProjectGlyph, ProgressBar, ViewAll, PageControls, FilterSelect, WorkspaceArt, projectStatus, matchesSearch, formatDate, type Section } from '@/components/DashboardVisuals'
import { type Project, type Member, dateValue, metrics, paginate, projectProgress, statuses, validate } from '@/lib/dashboard'

type ViewProps = { search: string; navigate: (section: Section) => void }
export function ProjectDetails({ project }: { project: Project }) {
  const { state } = useDashboard()
  const members = state.members.filter(member => member.projectId === project.id)
  const tasks = state.tasks.filter(task => task.projectId === project.id)
  return <Dialog><DialogTrigger asChild><Button className="pk-detail-button" size="sm" variant="ghost"><Eye size={15} />Ver detalles</Button></DialogTrigger><DialogContent className="pk-dialog max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{project.name}</DialogTitle><DialogDescription>{project.description}</DialogDescription></DialogHeader>
    <dl className="pk-detail-grid"><dt>Categoría</dt><dd>{project.category}</dd><dt>Prioridad</dt><dd><Pill text={project.priority} /></dd><dt>Progreso</dt><dd>{projectProgress(tasks)}%</dd><dt>Tareas completadas</dt><dd>{tasks.filter(t => t.status === 'Completado').length} de {tasks.length}</dd></dl>
    <h3 className="font-semibold">Miembros del equipo</h3>{members.length ? <ul className="space-y-2">{members.map((member, i) => <li className="flex items-center gap-3" key={member.userId}><PersonAvatar name={member.name} index={i} small /><span>{member.name}<small className="block text-muted-foreground">{member.position} · {member.isActive ? 'Activo' : 'Inactivo'}</small></span></li>)}</ul> : <p>Sin miembros asignados.</p>}
    <h3 className="font-semibold">Tareas</h3>{tasks.length ? <ul className="space-y-3">{tasks.map(task => <li key={task.id} className="flex flex-wrap justify-between gap-2 text-sm"><span>{task.description}<small className="block text-muted-foreground">{formatDate(task.dateline)}</small></span><Pill text={task.status} /></li>)}</ul> : <p>Sin tareas registradas.</p>}
  </DialogContent></Dialog>
}
function MemberDetails({ member }: { member: Member }) {
  const { state } = useDashboard()
  const fields = { ID: member.userId, Nombre: member.name, Rol: member.role, Correo: member.email, Puesto: member.position, Nacimiento: formatDate(member.birthdate), Teléfono: member.phone, Proyecto: state.projects.find(p => p.id === member.projectId)?.name ?? 'Sin proyecto', Estado: member.isActive ? 'Activo' : 'Inactivo' }
  return <Dialog><DialogTrigger asChild><Button className="pk-icon-action" variant="ghost" size="icon" title={`Ver a ${member.name}`} aria-label={`Ver a ${member.name}`}><Eye size={15} /></Button></DialogTrigger><DialogContent className="pk-dialog"><DialogHeader><DialogTitle>{member.name}</DialogTitle><DialogDescription>Información del miembro del equipo.</DialogDescription></DialogHeader><dl className="pk-detail-grid">{Object.entries(fields).map(([label, value]) => <div key={label} className="contents"><dt>{label}</dt><dd className="break-all">{value}</dd></div>)}</dl></DialogContent></Dialog>
}
export function OverviewView({ navigate }: Pick<ViewProps, 'navigate'>) {
  const { state, commit } = useDashboard()
  const [day, setDay] = useState<Date>()
  const [savingTask, setSavingTask] = useState<string | null>(null)
  const total = state.tasks.length
  const totals = metrics(state)
  const completion = total ? Math.round(totals.completed / total * 100) : 0
  const distribution = statuses.map(status => ({ status, count: state.tasks.filter(t => t.status === status).length }))
  const completedAngle = total ? totals.completed / total * 360 : 0
  const progressAngle = completedAngle + (total ? distribution[1].count / total * 360 : 0)
  const agenda = state.tasks.filter(t => t.status !== 'Completado' && (!day || t.dateline === dateValue(day))).sort((a, b) => a.dateline.localeCompare(b.dateline)).slice(0, 3)
  const cards = [
    { title: 'Proyectos', value: totals.projects, detail: 'Proyectos en tu espacio', Icon: Folder, tone: 'violet' },
    { title: 'Miembros', value: state.members.length, detail: `${totals.active} miembros activos`, Icon: Users, tone: 'blue' },
    { title: 'Tareas', value: total, detail: `${totals.pending} por completar`, Icon: ListTodo, tone: 'amber' },
    { title: 'Completadas', value: totals.completed, detail: 'Del total de tareas', Icon: CheckCircle2, tone: 'green' },
  ]
  return <div className="pk-view-stack">
    <section className="pk-welcome"><div><span className="pk-eyebrow">TU ESPACIO DE TRABAJO</span><h2>¡Todo listo para avanzar!</h2><p>Organiza tus ideas, conecta a tu equipo<br className="pk-desktop-break" /> y convierte cada tarea en un logro.</p><ViewAll onClick={() => navigate('projects')}>Explorar mis proyectos</ViewAll></div><WorkspaceArt /></section>
    <div className="pk-stats">{cards.map(({ title, value, detail, Icon, tone }, i) => <section className={`pk-stat pk-stat-${tone}`} key={title}><div className="pk-stat-icon"><Icon aria-hidden="true" /></div><div className="pk-stat-copy"><h2>{title}</h2><strong>{value}</strong><small>{detail}</small></div>{i === 3 && <div className="pk-mini-ring" style={{ background: `conic-gradient(#10ac59 ${completion * 3.6}deg, #cde8db 0)` }} aria-label={`${completion}% de tareas completadas`}><span>{completion}%</span></div>}</section>)}</div>
    <div className="pk-overview-grid"><div className="pk-view-stack">
      <Panel title="Progreso de proyectos" icon={Folder} action={<ViewAll onClick={() => navigate('projects')} />}><div className="pk-project-rows">{state.projects.slice(0, 4).map((project, i) => { const progress = projectProgress(state.tasks.filter(t => t.projectId === project.id)); return <div className="pk-project-row" key={project.id}><ProjectGlyph index={i} /><strong>{project.name}</strong><div className="pk-row-progress"><ProgressBar value={progress} label={`Progreso de ${project.name}`} /><b>{progress}%</b></div><Pill text={projectStatus(project, state.tasks)} /></div> })}{!state.projects.length && <p className="pk-empty">Tus proyectos aparecerán aquí.</p>}</div></Panel>
      <Panel title="Últimas tareas" icon={CheckCheck} action={<ViewAll onClick={() => navigate('tasks')}>Ver todas</ViewAll>}><div className="pk-recent-tasks">{[...state.tasks].reverse().slice(0, 4).map(task => <div key={task.id} className="pk-recent-task"><Checkbox checked={task.status === 'Completado'} disabled={savingTask !== null} aria-label={`Marcar ${task.description} como ${task.status === 'Completado' ? 'pendiente' : 'completada'}`} onCheckedChange={async checked => { setSavingTask(task.id); try { await commit({ type: 'task', value: { ...task, status: checked ? 'Completado' : 'Pendiente' } }) } finally { setSavingTask(null) } }} /><div><strong>{task.description}</strong><small>{state.projects.find(p => p.id === task.projectId)?.name ?? 'Sin proyecto'}</small></div><Pill text={task.priority} /><span className="pk-task-date"><CalendarDays size={14} />{formatDate(task.dateline)}</span></div>)}{!total && <p className="pk-empty">Todavía no hay tareas registradas.</p>}</div></Panel>
      <Panel title="Actividad reciente" icon={Activity}><div className="pk-activity-list">{state.activity.length ? state.activity.map((activity, i) => <div className="pk-activity" key={i}><span className="pk-activity-dot"><CheckCircle2 size={15} /></span><div><p>{activity}</p><small>Cambio realizado en esta sesión</small></div></div>) : <p className="pk-empty">Sin actividad todavía. Los cambios de tu equipo se mostrarán aquí.</p>}</div></Panel>
    </div><div className="pk-view-stack">
      <Panel title="Estado de las tareas" icon={LayoutDashboard}><div className="pk-task-chart"><div className="pk-donut" role="img" aria-label={`${totals.completed} completadas, ${distribution[1].count} en progreso y ${distribution[0].count} pendientes`} style={{ background: total ? `conic-gradient(#8b36f5 0deg ${completedAngle}deg, #b68aef ${completedAngle}deg ${progressAngle}deg, #e9ddfa ${progressAngle}deg 360deg)` : '#eee8f6' }}><div><strong>{completion}%</strong><span>completado</span></div></div><div className="pk-chart-legend">{distribution.map(({ status, count }, i) => <div key={status}><span className={`pk-legend-dot pk-legend-${i}`} /><span>{status}</span><strong>{count}</strong></div>)}</div></div></Panel>
      <Panel title="Calendario del equipo" icon={CalendarDays} className="pk-calendar-panel"><Calendar locale={es} mode="single" selected={day} onSelect={setDay} modifiers={{ delivery: state.tasks.map(task => new Date(`${task.dateline}T12:00:00`)) }} modifiersClassNames={{ delivery: 'pk-delivery-day' }} /><div className="pk-calendar-caption"><span />Días con tareas programadas</div></Panel>
      <Panel title={day ? `Tareas del ${formatDate(dateValue(day))}` : 'Agenda de tareas'} icon={Clock3} action={day ? <button className="pk-text-link" onClick={() => setDay(undefined)}>Ver todas</button> : undefined}><div className="pk-agenda">{agenda.map(task => <div key={task.id}><span className="pk-agenda-icon"><CalendarDays size={19} /></span><div><strong>{task.description}</strong><small>{formatDate(task.dateline)}</small></div></div>)}{!agenda.length && <p className="pk-empty">No hay entregas pendientes{day ? ' para este día' : ''}.</p>}</div></Panel>
    </div></div>
  </div>
}
export function ProjectsView({ search }: Pick<ViewProps, 'search'>) {
  const { state } = useDashboard()
  const [filter, setFilter] = useState('')
  const projects = state.projects.filter(project => (!filter || projectStatus(project, state.tasks) === filter) && matchesSearch(search, project.name, project.description, project.category))
  return <div className="pk-view-stack"><div className="pk-section-toolbar"><div className="pk-filter-chips" aria-label="Filtrar proyectos por estado">{['', 'En progreso', 'Planificado', 'Completado'].map(status => <button key={status} className={filter === status ? 'is-active' : ''} aria-pressed={filter === status} onClick={() => setFilter(status)}>{status || 'Todos'}<span>{state.projects.filter(p => !status || projectStatus(p, state.tasks) === status).length}</span></button>)}</div><span className="pk-results-count">{projects.length} proyectos</span></div>
    <div className="pk-project-grid">{projects.map(project => { const index = state.projects.indexOf(project); const tasks = state.tasks.filter(t => t.projectId === project.id); const members = state.members.filter(m => m.projectId === project.id); const progress = projectProgress(tasks); return <article className="pk-project-card" key={project.id}><div className="pk-project-card-top"><ProjectGlyph index={index} /><Pill text={project.priority} /></div><h2>{project.name}</h2><p>{project.description}</p><div className="pk-project-progress"><ProgressBar value={progress} label={`Progreso de ${project.name}`} /><b>{progress}%</b></div><div className="pk-project-meta"><div className="pk-avatar-stack">{members.slice(0, 3).map((member, i) => <PersonAvatar key={member.userId} name={member.name} index={i} small />)}<span>{members.length} miembros</span></div><Pill text={projectStatus(project, state.tasks)} /></div><div className="pk-project-card-footer"><ProjectDetails project={project} /><div className="pk-actions"><ProjectForm project={project} compact /><DeleteDialog compact title={`Eliminar ${project.name}`} description={`Se eliminará el proyecto y sus ${tasks.length} tareas. Sus miembros quedarán sin proyecto.`} action={{ type: 'deleteProject', id: project.id }} /></div></div></article> })}</div>{!projects.length && <div className="pk-panel pk-empty-state"><Folder /><h2>No encontramos proyectos</h2><p>Cambia la búsqueda o crea un nuevo proyecto.</p></div>}
  </div>
}
export function TeamView({ search }: Pick<ViewProps, 'search'>) {
  const { state } = useDashboard()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [requestedPage, setPage] = useState(1)
  const filtered = state.members.filter(m => (!role || m.role === role) && matchesSearch(search, m.name, m.email, m.position, m.role) && matchesSearch(query, m.name, m.email))
  const { page, pages, items } = paginate(filtered, requestedPage, 5)
  return <section className="pk-panel pk-data-panel"><div className="pk-table-toolbar"><div className="pk-search-input"><Search size={17} /><input aria-label="Buscar miembro por nombre o correo" placeholder="Buscar miembro por nombre o correo..." value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} /></div><FilterSelect label="Todos los roles" value={role} onChange={value => { setRole(value); setPage(1) }} options={[...new Set(state.members.map(m => m.role))].map(value => ({ value, label: value }))} /></div>
    <div className="pk-table-scroll"><Table className="pk-table"><TableHeader><TableRow>{['Nombre', 'Rol', 'Cargo', 'Proyecto', 'Estado', 'Acciones'].map(title => <TableHead key={title}>{title}</TableHead>)}</TableRow></TableHeader><TableBody>{items.map(member => <TableRow key={member.userId}><TableCell><div className="pk-person-cell"><PersonAvatar name={member.name} index={state.members.indexOf(member)} /><div><strong>{member.name}</strong><small>{member.email}</small></div></div></TableCell><TableCell><span className="pk-role-tag">{member.role}</span></TableCell><TableCell>{member.position}</TableCell><TableCell>{state.projects.find(p => p.id === member.projectId)?.name ?? 'Sin proyecto'}</TableCell><TableCell><Pill text={member.isActive ? 'Activo' : 'Inactivo'} /></TableCell><TableCell><div className="pk-actions"><MemberDetails member={member} /><MemberForm member={member} compact /><DeleteDialog compact title={`Eliminar a ${member.name}`} description="Sus tareas quedarán sin responsable para que puedas reasignarlas." action={{ type: 'deleteMember', id: member.userId }} /></div></TableCell></TableRow>)}{!items.length && <TableRow><TableCell colSpan={6} className="pk-empty">No hay miembros que coincidan con la búsqueda.</TableCell></TableRow>}</TableBody></Table></div><PageControls page={page} pages={pages} total={filtered.length} onChange={setPage} noun="miembros" />
  </section>
}
export function SettingsView() {
  const { state, commit } = useDashboard()
  const [version, setVersion] = useState(0)
  return <div className="pk-settings-layout"><nav className="pk-panel pk-settings-nav" aria-label="Secciones de configuración"><a href="#settings-organization"><Settings2 size={18} />General</a><a href="#settings-notifications"><ListTodo size={18} />Preferencias</a><a href="#pk-session-info"><Layers3 size={18} />Esta sesión</a></nav><div className="pk-view-stack"><section className="pk-panel pk-settings-card"><div className="pk-settings-intro"><div><span className="pk-eyebrow">HAZLO TUYO</span><h2>Configuración de tu espacio</h2><p>Un equipo organizado empieza por los pequeños detalles.</p></div><span className="pk-settings-illustration"><Settings2 /></span></div><DataForm key={version} columns initial={{ ...state.settings }} fields={[
    { key: 'organization', label: 'Nombre de la organización', section: 'Información general' }, { key: 'email', label: 'Correo de contacto', type: 'email' },
    { key: 'notifications', label: 'Permitir notificaciones en el dashboard', type: 'switch', optional: true, section: 'Notificaciones y tareas' },
    { key: 'pageSize', label: 'Tareas por página', type: 'select', options: ['3', '5', '10'].map(value => ({ value, label: value })) },
  ]} onCancel={() => setVersion(value => value + 1)} submitLabel="Guardar cambios" validate={values => validate('settings', values, state)} onSave={async values => { await commit({ type: 'settings', value: { organization: String(values.organization).trim(), email: String(values.email).trim(), notifications: values.notifications === true, pageSize: String(values.pageSize) } }) }} /></section><section id="pk-session-info" className="pk-session-info"><CheckCircle2 size={20} /><div><strong>Tu espacio, durante esta sesión</strong><p>El guardado es simulado. Los proyectos, miembros, tareas y preferencias se mantienen en memoria y se restauran al recargar la página.</p></div></section></div></div>
}
