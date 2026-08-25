/**
 * dsh-goal-planner host entry.
 *
 * Data model (shared with the WeChat push pipeline, see README):
 *   {
 *     updatedAt: string,
 *     goals: [{ id, title, deadline, note? }],
 *     tasks: [{ id, goalId, title, detail?, time?, location?, materials?, steps?, note?, dueDate, status }]
 *   }
 *
 * Loopback HTTP API:
 *   GET  /api/goal-planner/state   -> full document
 *   POST /api/goal-planner/save    -> replace the full document (validated)
 *   POST /api/goal-planner/toggle  -> { taskId } flips todo <-> done
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs'
import { join, dirname, isAbsolute } from 'node:path'
import { homedir } from 'node:os'

export const name = 'dsh-goal-planner'

const API_PREFIX = '/api/goal-planner'

function dshHome() {
  return process.env.DSH_HOME && process.env.DSH_HOME.trim() !== ''
    ? process.env.DSH_HOME.trim()
    : join(homedir(), '.dsh')
}

function resolveTasksPath(config) {
  const raw = config && typeof config.tasksPath === 'string' ? config.tasksPath.trim() : ''
  if (raw === '') return join(dshHome(), 'dsh-goal-planner', 'tasks.json')
  return isAbsolute(raw) ? raw : join(process.cwd(), raw)
}

function isLoopback(request) {
  const addr = request.socket && request.socket.remoteAddress
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1'
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  response.end(body)
}

async function readBody(request) {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

/** Structural validation for a full document save. */
function isDocument(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  if (!Array.isArray(value.goals) || !Array.isArray(value.tasks)) return false
  for (const goal of value.goals) {
    if (typeof goal !== 'object' || goal === null) return false
    if (typeof goal.id !== 'string' || goal.id === '') return false
    if (typeof goal.title !== 'string') return false
  }
  for (const task of value.tasks) {
    if (typeof task !== 'object' || task === null) return false
    if (typeof task.id !== 'string' || task.id === '') return false
    if (typeof task.title !== 'string' || typeof task.dueDate !== 'string' || typeof task.status !== 'string') return false
  }
  return true
}

export function apply(ctx, config) {
  ctx.inject(['webServer'], (host) => {
    const file = resolveTasksPath(config)

    const load = () => {
      try {
        const parsed = JSON.parse(readFileSync(file, 'utf8'))
        return isDocument(parsed) ? parsed : { updatedAt: '', goals: [], tasks: [] }
      } catch {
        return { updatedAt: '', goals: [], tasks: [] }
      }
    }

    const save = (doc) => {
      mkdirSync(dirname(file), { recursive: true })
      const tmp = `${file}.tmp-${process.pid}`
      writeFileSync(tmp, JSON.stringify(doc, null, 2) + '\n', 'utf8')
      renameSync(tmp, file)
    }

    host.effect(() => {
      const disposers = []

      const route = (path, handler) => {
        const dispose = host.webServer.register({ kind: 'exact', path, handler })
        if (typeof dispose === 'function') disposers.push(dispose)
      }

      route(`${API_PREFIX}/state`, (request, response) => {
        if (request.method !== 'GET') return sendJson(response, 405, { error: 'method not allowed' })
        if (!isLoopback(request)) return sendJson(response, 403, { error: 'loopback only' })
        sendJson(response, 200, { ok: true, path: file, document: load() })
      })

      route(`${API_PREFIX}/save`, async (request, response) => {
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'method not allowed' })
        if (!isLoopback(request)) return sendJson(response, 403, { error: 'loopback only' })
        let body
        try {
          body = JSON.parse(await readBody(request))
        } catch {
          return sendJson(response, 400, { error: 'invalid JSON' })
        }
        if (!isDocument(body)) return sendJson(response, 400, { error: 'invalid document' })
        body.updatedAt = new Date().toISOString().slice(0, 10)
        save(body)
        sendJson(response, 200, { ok: true, document: body })
      })

      route(`${API_PREFIX}/toggle`, async (request, response) => {
        if (request.method !== 'POST') return sendJson(response, 405, { error: 'method not allowed' })
        if (!isLoopback(request)) return sendJson(response, 403, { error: 'loopback only' })
        let body
        try {
          body = JSON.parse(await readBody(request))
        } catch {
          return sendJson(response, 400, { error: 'invalid JSON' })
        }
        if (typeof body !== 'object' || body === null || typeof body.taskId !== 'string') {
          return sendJson(response, 400, { error: 'taskId required' })
        }
        const doc = load()
        const task = doc.tasks.find((t) => t.id === body.taskId)
        if (!task) return sendJson(response, 404, { error: 'task not found' })
        task.status = task.status === 'done' ? 'todo' : 'done'
        doc.updatedAt = new Date().toISOString().slice(0, 10)
        save(doc)
        sendJson(response, 200, { ok: true, document: doc })
      })

      return () => {
        for (const dispose of disposers) {
          try { dispose() } catch { /* already disposed */ }
        }
      }
    }, 'dsh-goal-planner: http routes')
  })
}
