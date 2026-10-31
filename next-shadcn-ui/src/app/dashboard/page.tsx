"use client"

import { useState } from 'react'
import { Bell, ChartNoAxesCombined, ChevronDown, CircleHelp, Folder, Home, Layers3, ListTodo, Menu, Search, Settings, Users, X, type LucideIcon } from 'lucide-react'
import { DashboardProvider, useDashboard } from '@/components/DashboardProvider'
import { OverviewView, ProjectsView, SettingsView, TeamView } from '@/components/DashboardSections'
import { ProjectForm, MemberForm, TaskForm } from '@/components/ProjectForm'
import { TasksTable } from '@/components/TaskTable'
import { PersonAvatar, RocketArt, matchesSearch, type Section } from '@/components/DashboardVisuals'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import './dashboard.css'

const sections: { id: Section; title: string; subtitle: string; icon: LucideIcon; navIcon: LucideIcon }[] = [
  { id: 'overview', title: 'Resumen', subtitle: 'Una vista general de tus proyectos, tareas y equipo', icon: ChartNoAxesCombined, navIcon: Home },
  { id: 'projects', title: 'Proyectos', subtitle: 'Administra y da seguimiento a cada uno de tus proyectos', icon: Folder, navIcon: Folder },
  { id: 'team', title: 'Equipo', subtitle: 'El talento que hace que las cosas sucedan', icon: Users, navIcon: Users },
  { id: 'tasks', title: 'Tareas', subtitle: 'Organiza las prioridades y avanza, una tarea a la vez', icon: ListTodo, navIcon: ListTodo },
  { id: 'settings', title: 'Configuración', subtitle: 'Personaliza las opciones de tu espacio de trabajo', icon: Settings, navIcon: Settings },
]
function DashboardContent() {
  const { state } = useDashboard()
  const [section, setSection] = useState<Section>('overview')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [popover, setPopover] = useState<'profile' | 'notifications' | null>(null)
  const current = sections.find(item => item.id === section)!
  const HeadingIcon = current.icon
  function navigate(next: Section) { setSection(next); setQuery(''); setSearchOpen(false); setMobileOpen(false); setPopover(null) }
  const results = query.trim() ? [
    ...state.projects.filter(p => matchesSearch(query, p.name, p.description)).map(p => ({ id: p.id, label: p.name, type: 'Proyecto', section: 'projects' as Section, Icon: Folder })),
    ...state.members.filter(m => matchesSearch(query, m.name, m.email, m.role)).map(m => ({ id: m.userId, label: m.name, type: 'Miembro', section: 'team' as Section, Icon: Users })),
    ...state.tasks.filter(t => matchesSearch(query, t.description)).map(t => ({ id: t.id, label: t.description, type: 'Tarea', section: 'tasks' as Section, Icon: ListTodo })),
  ].slice(0, 8) : []
  const sidebar = <><a className="pk-brand" href="/dashboard" onClick={event => { event.preventDefault(); navigate('overview') }}><span className="pk-brand-mark"><Layers3 /></span><span><strong>Proyekit</strong><small>Gestión de Proyectos</small></span></a><nav className="pk-navigation" aria-label="Navegación principal">{sections.map(({ id, title, navIcon: Icon }) => <button key={id} className={section === id ? 'is-active' : ''} aria-current={section === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon aria-hidden="true" /><span>{title}</span>{id === 'tasks' && <small>{state.tasks.filter(t => t.status !== 'Completado').length}</small>}</button>)}</nav><div className="pk-sidebar-bottom"><RocketArt /><div><strong>Ideas que despegan.</strong><p>Grandes proyectos, un paso a la vez.</p></div></div></>
  return <div className="proyekit"><a href="#pk-main" className="pk-skip-link">Saltar al contenido</a><aside className="pk-sidebar">{sidebar}</aside><div className="pk-main-shell">
    <header className="pk-topbar"><Dialog open={mobileOpen} onOpenChange={setMobileOpen}><DialogTrigger asChild><button className="pk-top-icon pk-mobile-toggle" aria-label="Abrir menú de navegación"><Menu /></button></DialogTrigger><DialogContent className="pk-mobile-menu"><DialogHeader className="sr-only"><DialogTitle>Menú de navegación</DialogTitle><DialogDescription>Elige una sección de Proyekit.</DialogDescription></DialogHeader>{sidebar}</DialogContent></Dialog>
      <div className="pk-global-search" role="search" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSearchOpen(false) }}><Search size={20} /><input value={query} aria-label="Buscar proyectos, tareas o miembros" placeholder="Buscar proyectos, tareas o miembros..." onFocus={() => setSearchOpen(true)} onChange={event => { setQuery(event.target.value); setSearchOpen(true) }} onKeyDown={event => { if (event.key === 'Escape') { setQuery(''); setSearchOpen(false) }; if (event.key === 'Enter' && results[0]) { setSection(results[0].section); setQuery(results[0].label); setSearchOpen(false) } }} />{query && <button aria-label="Limpiar búsqueda" onClick={() => setQuery('')}><X size={15} /></button>}{query && searchOpen && <div className="pk-search-results"><small>RESULTADOS EN TU ESPACIO</small>{results.map(({ id, label, type, section, Icon }) => <button key={id} onClick={() => { setSection(section); setQuery(label); setSearchOpen(false) }}><Icon size={17} /><span>{label}<small>{type}</small></span></button>)}{!results.length && <p>No encontramos coincidencias.</p>}</div>}</div>
      <div className="pk-top-actions"><div className="pk-top-popover-wrap"><button className="pk-top-icon" aria-label="Ver actividad y notificaciones" aria-expanded={popover === 'notifications'} onClick={() => setPopover(popover === 'notifications' ? null : 'notifications')}><Bell />{state.settings.notifications && state.activity.length > 0 && <span className="pk-notification-dot" />}</button>{popover === 'notifications' && <div className="pk-top-popover"><h2>Actividad de tu equipo</h2><p>{state.settings.notifications ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}</p>{state.activity.length ? <ul>{state.activity.slice(0, 5).map((activity, i) => <li key={i}>{activity}</li>)}</ul> : <p>Aún no hay cambios en esta sesión.</p>}</div>}</div>
        <Dialog><DialogTrigger asChild><button className="pk-top-icon pk-help-button" aria-label="Ayuda del dashboard"><CircleHelp /></button></DialogTrigger><DialogContent className="pk-dialog"><DialogHeader><DialogTitle>Tu espacio Proyekit</DialogTitle><DialogDescription>Proyectos, personas y prioridades en un solo lugar.</DialogDescription></DialogHeader><p className="text-sm">Usa el menú para administrar proyectos, equipo y tareas. Los gráficos se actualizan con cada cambio. Puedes buscar en la barra superior y filtrar las tablas.</p><p className="text-sm text-muted-foreground">El guardado es simulado: los datos se mantienen en memoria y se reinician al recargar la página.</p></DialogContent></Dialog>
        <div className="pk-profile-wrap"><button className="pk-profile" aria-expanded={popover === 'profile'} onClick={() => setPopover(popover === 'profile' ? null : 'profile')}><PersonAvatar name="Yakel Jiménez" /><span><strong>Yakel Jiménez</strong><small>Administradora</small></span><ChevronDown size={17} /></button>{popover === 'profile' && <div className="pk-top-popover pk-profile-menu"><h2>{state.settings.organization}</h2><p>{state.settings.email}</p><button onClick={() => navigate('settings')}><Settings size={16} />Configurar mi espacio</button></div>}</div>
      </div>
    </header>
    {popover && <button className="pk-popover-dismiss" aria-label="Cerrar menú" onClick={() => setPopover(null)} />}
    <main id="pk-main"><div className="pk-page-heading"><div className="pk-heading-title"><span className="pk-heading-icon"><HeadingIcon /></span><div><span className="pk-breadcrumb">Mi espacio / {current.title}</span><h1>{current.title}</h1><p>{current.subtitle}</p></div></div><div className="pk-heading-action">{section === 'projects' && <ProjectForm />}{section === 'team' && <MemberForm />}{section === 'tasks' && <TaskForm />}{section === 'overview' && <span className="pk-live-indicator"><span />Datos de esta sesión</span>}</div></div>
      <div className="pk-content" key={section}>{section === 'overview' && <OverviewView navigate={navigate} />}{section === 'projects' && <ProjectsView search={query} />}{section === 'team' && <TeamView search={query} />}{section === 'tasks' && <TasksTable search={query} />}{section === 'settings' && <SettingsView />}</div>
      <footer className="pk-footer"><span><Layers3 size={14} />Proyekit · Gestión de proyectos</span><small>Organiza. Colabora. Avanza.</small></footer>
    </main>
  </div></div>
}
export default function DashboardPage() { return <DashboardProvider><DashboardContent /></DashboardProvider> }
