"use client"

import { useId, type ReactNode } from 'react'
import { ArrowRight, BarChart3, Code2, Folder, Globe2, Layers3, ShoppingCart, Smartphone, type LucideIcon } from 'lucide-react'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { type Project, type Task, projectProgress } from '@/lib/dashboard'

export type Section = 'overview' | 'projects' | 'team' | 'tasks' | 'settings'
export function Panel({ title, icon: Icon, children, action, className = '' }: { title: string; icon?: LucideIcon; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={`pk-panel ${className}`}><div className="pk-panel-heading"><h2>{Icon && <Icon aria-hidden="true" />}{title}</h2>{action}</div>{children}</section>
}
export function ViewAll({ onClick, children = 'Ver todos' }: { onClick: () => void; children?: ReactNode }) { return <button className="pk-text-link" onClick={onClick}>{children}<ArrowRight size={16} /></button> }
export function Pill({ text }: { text: string }) {
  const tone = ['Completado', 'Completadas', 'Activo'].includes(text) ? 'green' : ['Alta', 'Urgente'].includes(text) ? 'rose' : ['Media', 'Pendiente', 'Planificado'].includes(text) ? 'amber' : text === 'En progreso' ? 'blue' : text === 'Inactivo' ? 'slate' : 'violet'
  return <span className={`pk-pill pk-pill-${tone}`}>{text === 'Activo' && <span className="pk-dot" />}{text}</span>
}
export function PersonAvatar({ name, index = 0, small = false }: { name: string; index?: number; small?: boolean }) {
  return <span className={`pk-avatar pk-tone-${index % 5}${small ? ' pk-avatar-small' : ''}`} title={name} aria-label={name}>{name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('')}</span>
}
const projectIcons = [ShoppingCart, Smartphone, BarChart3, Code2, Layers3, Globe2]
export function ProjectGlyph({ index = 0 }: { index?: number }) { const Icon = projectIcons[index % projectIcons.length] ?? Folder; return <span className={`pk-project-glyph pk-tone-${index % 5}`}><Icon aria-hidden="true" /></span> }
export function ProgressBar({ value, label }: { value: number; label: string }) { return <div className="pk-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div> }
export function projectStatus(project: Project, tasks: Task[]) {
  const relevant = tasks.filter(t => t.projectId === project.id)
  return projectProgress(relevant) === 100 ? 'Completado' : relevant.some(t => t.status !== 'Pendiente') ? 'En progreso' : 'Planificado'
}
export const matchesSearch = (query: string, ...values: string[]) => values.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim())
export function formatDate(value: string) { return value ? new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`)) : 'Sin fecha' }
export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  const id = useId()
  return <div className="pk-filter-select"><label htmlFor={id} className="sr-only">{label}</label><select id={id} value={value} onChange={e => onChange(e.target.value)}><option value="">{label}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
}
export function PageControls({ page, pages, total, onChange, noun = 'registros' }: { page: number; pages: number; total: number; onChange: (page: number) => void; noun?: string }) {
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(number => number === 1 || number === pages || Math.abs(page - number) <= 1)
  return <div className="pk-pagination"><span aria-live="polite">{total} {noun} · Página {page} de {pages}</span><Pagination aria-label={`Páginas de ${noun}`}><PaginationContent><PaginationItem><Button variant="ghost" disabled={page === 1} onClick={() => onChange(page - 1)}>‹ <span className="pk-page-word">Anterior</span></Button></PaginationItem>{numbers.map((number, i) => <PaginationItem key={number} className="pk-page-item">{i > 0 && number - numbers[i - 1] > 1 && <PaginationEllipsis />}<PaginationLink href="#" isActive={page === number} aria-label={`Ir a la página ${number}`} onClick={event => { event.preventDefault(); onChange(number) }}>{number}</PaginationLink></PaginationItem>)}<PaginationItem><Button variant="ghost" disabled={page === pages} onClick={() => onChange(page + 1)}><span className="pk-page-word">Siguiente</span> ›</Button></PaginationItem></PaginationContent></Pagination></div>
}
export function RocketArt() {
  const id = useId().replace(/:/g, '')
  return <svg className="pk-rocket-art" viewBox="0 0 260 320" fill="none" aria-hidden="true"><defs><linearGradient id={`${id}body`} x1="100" y1="50" x2="195" y2="180" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset=".5" stopColor="#d7b9ff" /><stop offset="1" stopColor="#8950dd" /></linearGradient><linearGradient id={`${id}fire`} x1="89" y1="173" x2="56" y2="253" gradientUnits="userSpaceOnUse"><stop stopColor="#fff6c5" /><stop offset=".5" stopColor="#f8b4fc" /><stop offset="1" stopColor="#a167ec" stopOpacity="0" /></linearGradient><linearGradient id={`${id}wave`} x1="0" y1="230" x2="260" y2="320"><stop stopColor="#b278ff" /><stop offset="1" stopColor="#7242d7" /></linearGradient></defs>
    <g opacity=".8" fill="#d7bdff"><path d="m38 112 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" /><path d="m216 91 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z" /><path d="m207 192 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" /><circle cx="74" cy="57" r="2" /><circle cx="196" cy="40" r="2" /></g>
    <path d="M0 245c40-35 61 7 109-4 63-15 99-61 151-9v88H0Z" fill="#d9b5ff" opacity=".7" /><path d="M0 274c59-68 130 31 260-30v76H0Z" fill={`url(#${id}wave)`} /><path d="M0 301c78-66 151 26 260-23v42H0Z" fill="#5c32b1" opacity=".65" />
    <g transform="rotate(30 130 135)"><path d="M109 184q-14 53 21 86 35-33 21-86Z" fill={`url(#${id}fire)`} /><path d="M101 112q-40 21-29 69l32-20M159 112q40 21 29 69l-32-20" fill="#b779fc" /><path d="M130 34c-42 27-48 94-25 151h50c23-57 17-124-25-151Z" fill={`url(#${id}body)`} /><path d="M109 57q21-26 42 0l-8-14-13-9-13 9Z" fill="#a165ee" /><circle cx="130" cy="103" r="23" fill="#7c42c4" /><circle cx="130" cy="103" r="17" fill="#c8b5f7" /><circle cx="130" cy="103" r="12" fill="#6c47ab" /><path d="M122 96q7-6 13-2" stroke="#ede5ff" strokeWidth="3" strokeLinecap="round" /><path d="M107 177h46l-4 13h-38Z" fill="#8145c7" /><path d="M130 147v40" stroke="#d8b4ff" strokeWidth="8" strokeLinecap="round" /></g>
    <g fill="#eee0ff"><circle cx="68" cy="244" r="18" /><circle cx="89" cy="255" r="22" /><circle cx="46" cy="262" r="23" /></g>
  </svg>
}
export function WorkspaceArt() {
  return <svg className="pk-workspace-art" viewBox="0 0 360 180" fill="none" aria-hidden="true"><ellipse cx="197" cy="163" rx="150" ry="14" fill="#c8b0f5" opacity=".35" /><circle cx="235" cy="86" r="70" fill="#e2d0ff" /><circle cx="75" cy="97" r="43" fill="#efe3ff" /><rect x="97" y="22" width="164" height="113" rx="13" fill="#fff" stroke="#c3a3ef" strokeWidth="2" /><rect x="111" y="36" width="60" height="86" rx="6" fill="#f2e9ff" /><rect x="181" y="37" width="65" height="8" rx="4" fill="#dfccfa" />{[61, 84, 107].map(y => <g key={y}><circle cx="188" cy={y} r="7" fill="#ad69f7" /><path d={`m185 ${y} 2 2 4-4`} stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /><rect x="202" y={y - 3} width="40" height="6" rx="3" fill="#e8daf9" /></g>)}<rect x="123" y="50" width="35" height="7" rx="3" fill="#b48ae9" /><rect x="123" y="67" width="27" height="5" rx="2.5" fill="#d6bdf4" /><rect x="123" y="81" width="31" height="5" rx="2.5" fill="#d6bdf4" /><path d="m80 137 38-26h132l31 27-13 10H91Z" fill="#8c53cf" /><path d="m110 111 10-49h126l9 49Z" fill="#6737a4" opacity=".95" /><path d="m132 97 6-24h89l4 24Z" fill="#b886f4" /><path d="M64 147v-30m0 16q-21-5-18-22 20 1 18 22m0-11q18-4 17-20-17 0-17 20" stroke="#9b63da" strokeWidth="4" strokeLinecap="round" /><path d="M288 148v-46m0 29q-24-6-21-26 23 1 21 26m0-15q24-6 23-26-23 2-23 26" stroke="#9b63da" strokeWidth="4" strokeLinecap="round" /><path d="m49 146 3 17h23l3-17m197 0 3 17h23l3-17" fill="#bf99ee" /><path d="m305 39 3-7 3 7 7 3-7 3-3 7-3-7-7-3Z" fill="#b988f3" /><circle cx="58" cy="44" r="4" fill="#cba6f6" /></svg>
}
