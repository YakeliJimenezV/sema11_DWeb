import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
const source = fs.readFileSync(new URL('../src/lib/dashboard.ts', import.meta.url), 'utf8')
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
const model = {}
new Function('exports', output)(model)
const { initialState, dashboardReducer: reduce, metrics, validate, paginate, projectProgress, validDate } = model
const fresh = () => structuredClone(initialState)

test('crear un proyecto incorpora los miembros elegidos y actualiza el resumen', () => {
  const state = fresh()
  const project = { id: 'nuevo', name: 'Nuevo', description: 'Descripción', category: 'Desarrollo Web', priority: 'Alta' }
  const next = reduce(state, { type: 'project', value: project, memberIds: ['u1'] })
  assert.equal(next.projects.find(p => p.id === 'nuevo').name, 'Nuevo')
  assert.equal(next.members.find(m => m.userId === 'u1').projectId, 'nuevo')
  assert.equal(next.tasks.find(t => t.id === 't1').userId, '')
  assert.equal(metrics(next).projects, 7)
  assert.equal(state.projects.length, 6)
})
test('editar miembros conserva su identidad y actualiza los miembros activos', () => {
  const state = fresh()
  const member = { ...state.members[0], name: 'María editada', isActive: false }
  const next = reduce(state, { type: 'member', value: member })
  assert.equal(next.members.length, 5)
  assert.equal(next.members[0].name, 'María editada')
  assert.equal(metrics(next).active, 3)
})
test('CRUD de tareas actualiza conteos y progreso con datos reales', () => {
  const state = fresh()
  const task = { ...state.tasks[0], id: 'nueva', status: 'Pendiente' }
  const created = reduce(state, { type: 'task', value: task })
  assert.equal(created.tasks.length, 6)
  const edited = reduce(created, { type: 'task', value: { ...task, status: 'Completado' } })
  assert.equal(metrics(edited).completed, 2)
  assert.equal(projectProgress(edited.tasks.filter(t => t.projectId === 'p1')), 33)
  const deleted = reduce(edited, { type: 'deleteTask', id: 'nueva' })
  assert.equal(deleted.tasks.length, 5)
  assert.equal(metrics(deleted).completed, 1)
})
test('eliminar proyecto retira tareas y libera miembros sin borrar personas', () => {
  const next = reduce(fresh(), { type: 'deleteProject', id: 'p1' })
  assert.equal(next.projects.length, 5)
  assert.equal(next.tasks.length, 3)
  assert.equal(next.members.length, 5)
  assert.equal(next.members.find(m => m.userId === 'u1').projectId, '')
  assert.ok(next.tasks.every(t => t.projectId !== 'p1'))
})
test('eliminar un miembro deja sus tareas disponibles para reasignación', () => {
  const next = reduce(fresh(), { type: 'deleteMember', id: 'u1' })
  assert.equal(next.members.length, 4)
  assert.equal(next.tasks.find(t => t.id === 't1').userId, '')
})
test('nuevos miembros se crean y los correos duplicados se rechazan', () => {
  const state = fresh()
  const member = { ...state.members[0], userId: 'nuevo', email: 'nuevo@example.com' }
  assert.deepEqual(validate('member', member, state), [])
  assert.equal(reduce(state, { type: 'member', value: member }).members.length, 6)
  assert.ok(validate('member', { ...member, email: 'MARIA@example.com' }, state).some(error => error.includes('Ya existe')))
})
test('validación impide responsables de otros proyectos y fechas inexistentes', () => {
  const state = fresh()
  assert.deepEqual(validate('task', state.tasks[0], state), [])
  assert.ok(validate('task', { ...state.tasks[0], userId: 'u4' }, state).length)
  assert.ok(validate('task', { ...state.tasks[0], dateline: '2026-02-30' }, state).length)
  assert.equal(validDate('2024-02-29'), true)
  assert.equal(validDate('2025-02-29'), false)
})
test('formularios rechazan datos vacíos, correo inválido y proyecto sin miembros', () => {
  const state = fresh()
  for (const kind of ['project', 'member', 'task', 'settings']) assert.ok(validate(kind, {}, state).length)
  assert.ok(validate('member', { ...state.members[0], email: 'sin-arroba', birthdate: '2999-01-01' }, state, 'u1').length >= 2)
  assert.ok(validate('project', { ...state.projects[0], memberIds: [] }, state).length)
})
test('paginación cubre la última página, eliminación de filas y lista vacía', () => {
  const state = fresh()
  assert.deepEqual(paginate(state.tasks, 2, 3).items.map(t => t.id), ['t4', 't5'])
  assert.equal(paginate(state.tasks.slice(0, 3), 2, 3).page, 1)
  assert.deepEqual(paginate([], 4, 3), { pages: 1, page: 1, items: [] })
})
test('configuración y resumen reflejan el estado en memoria', () => {
  const state = fresh()
  const settings = { ...state.settings, organization: 'Equipo de laboratorio', pageSize: '5', notifications: false }
  assert.deepEqual(validate('settings', settings, state), [])
  const next = reduce(state, { type: 'settings', value: settings })
  assert.equal(next.settings.organization, 'Equipo de laboratorio')
  assert.equal(next.settings.notifications, false)
  assert.deepEqual(metrics(next), { projects: 6, completed: 1, pending: 4, active: 4 })
  assert.equal(projectProgress([]), 0)
})
