export type Project = { id: string; name: string; description: string; category: string; priority: string }
export type Member = { userId: string; role: string; name: string; email: string; position: string; birthdate: string; phone: string; projectId: string; isActive: boolean }
export type Task = { id: string; description: string; projectId: string; status: string; priority: string; userId: string; dateline: string }
export type Settings = { organization: string; email: string; notifications: boolean; pageSize: string }
export type State = { projects: Project[]; members: Member[]; tasks: Task[]; settings: Settings; activity: string[] }
export type Values = Record<string, string | boolean | string[]>
export const statuses = ['Pendiente', 'En progreso', 'Completado']
export const priorities = ['Baja', 'Media', 'Alta', 'Urgente']
export const categories = ['Desarrollo Web', 'Desarrollo Mobile', 'Diseño', 'Marketing', 'Otro']
export const initialState: State = {
  projects: [
    { id: 'p1', name: 'E-commerce Platform', description: 'Plataforma de comercio electrónico con Next.js', category: 'Desarrollo Web', priority: 'Alta' },
    { id: 'p2', name: 'Mobile App', description: 'Aplicación móvil con React Native', category: 'Desarrollo Mobile', priority: 'Media' },
    { id: 'p3', name: 'Dashboard Analytics', description: 'Panel de análisis con visualizaciones', category: 'Diseño', priority: 'Media' },
    { id: 'p4', name: 'API Gateway', description: 'Microservicios con Node.js', category: 'Desarrollo Web', priority: 'Alta' },
    { id: 'p5', name: 'Design System', description: 'Librería de componentes reutilizables', category: 'Diseño', priority: 'Baja' },
    { id: 'p6', name: 'Marketing Website', description: 'Sitio web institucional', category: 'Marketing', priority: 'Media' },
  ],
  members: [
    { userId: 'u1', name: 'María García', role: 'Desarrollador', position: 'Frontend Developer', email: 'maria@example.com', birthdate: '1998-04-15', phone: '987654321', projectId: 'p1', isActive: true },
    { userId: 'u2', name: 'Juan Pérez', role: 'Desarrollador', position: 'Backend Developer', email: 'juan@example.com', birthdate: '1996-08-20', phone: '987654322', projectId: 'p1', isActive: true },
    { userId: 'u3', name: 'Ana López', role: 'Diseñador', position: 'UI/UX Designer', email: 'ana@example.com', birthdate: '1999-02-10', phone: '987654323', projectId: 'p2', isActive: false },
    { userId: 'u4', name: 'Carlos Ruiz', role: 'Desarrollador', position: 'DevOps Engineer', email: 'carlos@example.com', birthdate: '1995-11-05', phone: '987654324', projectId: 'p4', isActive: true },
    { userId: 'u5', name: 'Laura Martínez', role: 'Administrador', position: 'Project Manager', email: 'laura@example.com', birthdate: '1994-06-25', phone: '987654325', projectId: 'p4', isActive: true },
  ],
  tasks: [
    { id: 't1', description: 'Implementar autenticación', projectId: 'p1', status: 'En progreso', priority: 'Alta', userId: 'u1', dateline: '2025-11-15' },
    { id: 't2', description: 'Diseñar pantalla de perfil', projectId: 'p2', status: 'Pendiente', priority: 'Media', userId: 'u3', dateline: '2025-11-20' },
    { id: 't3', description: 'Configurar CI/CD', projectId: 'p4', status: 'Completado', priority: 'Alta', userId: 'u4', dateline: '2025-11-10' },
    { id: 't4', description: 'Optimizar queries SQL', projectId: 'p1', status: 'En progreso', priority: 'Urgente', userId: 'u2', dateline: '2025-11-12' },
    { id: 't5', description: 'Documentar API endpoints', projectId: 'p4', status: 'Pendiente', priority: 'Baja', userId: 'u5', dateline: '2025-11-25' },
  ],
  settings: { organization: 'Mi equipo', email: 'equipo@example.com', notifications: true, pageSize: '3' },
  activity: [],
}
export type Action =
  | { type: 'project'; value: Project; memberIds: string[] }
  | { type: 'member'; value: Member }
  | { type: 'task'; value: Task }
  | { type: 'deleteProject' | 'deleteMember' | 'deleteTask'; id: string }
  | { type: 'settings'; value: Settings }
const upsert = <T,>(items: T[], value: T, key: keyof T) => items.some(item => item[key] === value[key]) ? items.map(item => item[key] === value[key] ? value : item) : [...items, value]
export function dashboardReducer(state: State, action: Action): State {
  let next = state
  let message = ''
  switch (action.type) {
    case 'project': {
      const members = state.members.map(m => action.memberIds.includes(m.userId) ? { ...m, projectId: action.value.id } : m.projectId === action.value.id ? { ...m, projectId: '' } : m)
      next = { ...state, projects: upsert(state.projects, action.value, 'id'), members }
      message = `Proyecto guardado: ${action.value.name}`
      break
    }
    case 'member': next = { ...state, members: upsert(state.members, action.value, 'userId') }; message = `Miembro guardado: ${action.value.name}`; break
    case 'task': next = { ...state, tasks: upsert(state.tasks, action.value, 'id') }; message = `Tarea guardada: ${action.value.description}`; break
    case 'deleteProject':
      next = { ...state, projects: state.projects.filter(p => p.id !== action.id), tasks: state.tasks.filter(t => t.projectId !== action.id), members: state.members.map(m => m.projectId === action.id ? { ...m, projectId: '' } : m) }
      message = 'Proyecto eliminado'; break
    case 'deleteMember': next = { ...state, members: state.members.filter(m => m.userId !== action.id) }; message = 'Miembro eliminado'; break
    case 'deleteTask': next = { ...state, tasks: state.tasks.filter(t => t.id !== action.id) }; message = 'Tarea eliminada'; break
    case 'settings': next = { ...state, settings: action.value }; message = 'Configuración guardada'; break
  }
  // Keep task references valid when a member moves or is deleted.
  return { ...next, tasks: next.tasks.map(t => t.userId && !next.members.some(m => m.userId === t.userId && m.projectId === t.projectId) ? { ...t, userId: '' } : t), activity: [message, ...state.activity].slice(0, 8) }
}
export const projectProgress = (tasks: Task[]) => tasks.length ? Math.round(tasks.filter(t => t.status === 'Completado').length / tasks.length * 100) : 0
export function metrics(state: State) {
  return { projects: state.projects.length, completed: state.tasks.filter(t => t.status === 'Completado').length, pending: state.tasks.filter(t => t.status !== 'Completado').length, active: state.members.filter(m => m.isActive).length }
}
export function paginate<T>(items: T[], requestedPage: number, pageSize: number) {
  const pages = Math.max(1, Math.ceil(items.length / pageSize))
  const page = Math.max(1, Math.min(requestedPage, pages))
  return { pages, page, items: items.slice((page - 1) * pageSize, page * pageSize) }
}
export function dateValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime()) && dateValue(date) === value
}
export function validate(kind: 'project' | 'member' | 'task' | 'settings', v: Values, state: State, id?: string): string[] {
  const errors: string[] = []
  const text = (key: string) => String(v[key] ?? '').trim()
  const required = kind === 'project' ? ['name', 'description', 'category', 'priority'] : kind === 'member' ? ['name', 'role', 'email', 'position', 'birthdate', 'phone'] : kind === 'task' ? ['description', 'projectId', 'status', 'priority', 'userId', 'dateline'] : ['organization', 'email', 'pageSize']
  if (required.some(key => !text(key))) errors.push('Completa todos los campos obligatorios.')
  if ((kind === 'member' || kind === 'settings') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('email'))) errors.push('Ingresa un correo electrónico válido.')
  if (kind === 'project') {
    if (!categories.includes(text('category')) || !priorities.includes(text('priority'))) errors.push('Selecciona una categoría y prioridad válidas.')
    if (!Array.isArray(v.memberIds) || v.memberIds.length === 0) errors.push('Selecciona al menos un miembro del equipo.')
    else if (v.memberIds.some(id => !state.members.some(m => m.userId === id))) errors.push('Uno de los miembros ya no existe.')
  }
  if (kind === 'member') {
    if (!/^[+\d][\d\s()-]{6,19}$/.test(text('phone')) || !/^\d{7,15}$/.test(text('phone').replace(/\D/g, ''))) errors.push('Ingresa un teléfono válido con 7 a 15 dígitos.')
    if (!validDate(text('birthdate')) || text('birthdate') > dateValue(new Date())) errors.push('La fecha de nacimiento debe ser válida y no futura.')
    if (state.members.some(m => m.userId !== id && m.email.toLowerCase() === text('email').toLowerCase())) errors.push('Ya existe un miembro con ese correo.')
    if (text('projectId') && !state.projects.some(p => p.id === text('projectId'))) errors.push('Selecciona un proyecto válido.')
  }
  if (kind === 'task') {
    if (!state.projects.some(p => p.id === text('projectId'))) errors.push('Selecciona un proyecto válido.')
    if (!state.members.some(m => m.userId === text('userId') && m.projectId === text('projectId'))) errors.push('El responsable debe pertenecer al proyecto seleccionado.')
    if (!statuses.includes(text('status')) || !priorities.includes(text('priority'))) errors.push('Selecciona un estado y prioridad válidos.')
    if (!validDate(text('dateline'))) errors.push('Selecciona una fecha límite válida.')
  }
  if (kind === 'settings' && !['3', '5', '10'].includes(text('pageSize'))) errors.push('Selecciona un tamaño de página válido.')
  return errors
}
