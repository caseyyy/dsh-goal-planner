/**
 * Daily task preview panel: goal overview + date navigation + per-day task
 * cards. Reads and toggles through the host's loopback API.
 */
import { createElement as h, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Pill,
  StateDot,
  IconChevronLeftOutline14,
  IconChevronRightOutline14,
  IconRefreshOutline14,
} from '@deepseek-ai/dsh-client-ui-primitives'

const API = '/api/goal-planner'

function pad(n) {
  return String(n).padStart(2, '0')
}

function fmtDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function fmtDisplay(d) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`
}

function goalOf(document, goalId) {
  return (document?.goals || []).find((g) => g.id === goalId)
}

export function Panel({ t }) {
  const [document, setDocument] = useState(null)
  const [path, setPath] = useState('')
  const [error, setError] = useState('')
  const [anchor, setAnchor] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const refresh = () => {
    fetch(`${API}/state`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ok) {
          setDocument(data.document)
          setPath(data.path || '')
          setError('')
        } else {
          setError(String((data && data.error) || 'unknown error'))
        }
      })
      .catch((e) => setError(String((e && e.message) || e)))
  }

  useEffect(() => {
    refresh()
  }, [])

  const anchorStr = fmtDate(anchor)
  const dayTasks = useMemo(
    () => (document?.tasks || []).filter((task) => task.dueDate === anchorStr).sort((a, b) => a.id.localeCompare(b.id)),
    [document, anchorStr],
  )

  const toggle = (taskId) => {
    fetch(`${API}/toggle`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ taskId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.ok) setDocument(data.document)
        else setError(String((data && data.error) || 'toggle failed'))
      })
      .catch((e) => setError(String((e && e.message) || e)))
  }

  const shift = (days) => {
    const d = new Date(anchor)
    d.setDate(d.getDate() + days)
    setAnchor(d)
  }

  const isToday = anchorStr === fmtDate(new Date())
  const goals = document?.goals || []
  const allTasks = document?.tasks || []

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0 16px' } },
    // Goal overview
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
      goals.length === 0 &&
        h('div', { style: { color: 'var(--dsh-color-text-muted, #8b8e98)', fontSize: '12px' } }, t('goalEmpty')),
      goals.map((goal) => {
        const goalTasks = allTasks.filter((task) => task.goalId === goal.id)
        const doneCount = goalTasks.filter((task) => task.status === 'done').length
        const pct = goalTasks.length === 0 ? 0 : Math.round((doneCount / goalTasks.length) * 100)
        return h(
          'div',
          {
            key: goal.id,
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid var(--dsh-color-border, #e3e5ea)',
              borderRadius: '8px',
              padding: '8px 10px',
            },
          },
          h(StateDot, { state: doneCount === goalTasks.length && goalTasks.length > 0 ? 'done' : 'ongoing', size: 8 }),
          h(
            'div',
            { style: { flex: 1, minWidth: 0 } },
            h('div', { style: { fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, goal.title),
            h('div', { style: { fontSize: '11px', color: 'var(--dsh-color-text-muted, #8b8e98)' } }, `${t('deadline')} ${goal.deadline || '-'} · ${doneCount}/${goalTasks.length}`),
          ),
          h(
            'div',
            { style: { fontSize: '11px', color: 'var(--dsh-color-text-muted, #8b8e98)', whiteSpace: 'nowrap' } },
            `${pct}%`,
          ),
        )
      }),
    ),
    // Date navigation
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
      h(
        Button,
        { variant: 'ghost', size: 'sm', onClick: () => shift(-1), title: 'previous' },
        h(IconChevronLeftOutline14, { size: 14 }),
      ),
      h(
        Button,
        { variant: isToday ? 'primary' : 'ghost', size: 'sm', onClick: () => shift(0) },
        t('today'),
      ),
      h(
        Button,
        { variant: 'ghost', size: 'sm', onClick: () => shift(1), title: 'next' },
        h(IconChevronRightOutline14, { size: 14 }),
      ),
      h('div', { style: { flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: 600 } }, fmtDisplay(anchor)),
      h(
        Button,
        { variant: 'ghost', size: 'sm', onClick: refresh, title: t('refresh') },
        h(IconRefreshOutline14, { size: 14 }),
      ),
    ),
    error && h('div', { style: { color: 'var(--dsh-color-danger, #d93025)', fontSize: '12px' } }, error),
    // Day tasks
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      dayTasks.length === 0 &&
        h('div', { style: { color: 'var(--dsh-color-text-muted, #8b8e98)', fontSize: '12px', padding: '12px 0', textAlign: 'center' } }, t('noTasks')),
      dayTasks.map((task, index) => {
        const goal = goalOf(document, task.goalId)
        const done = task.status === 'done'
        return h(
          'div',
          {
            key: task.id,
            style: {
              border: '1px solid var(--dsh-color-border, #e3e5ea)',
              borderRadius: '8px',
              padding: '10px 12px',
              opacity: done ? 0.55 : 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            },
          },
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            h(
              'button',
              {
                onClick: () => toggle(task.id),
                title: done ? 'mark todo' : 'mark done',
                style: {
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: '1px solid var(--dsh-color-border, #c6c9d1)',
                  background: done ? 'var(--dsh-color-accent, #4d6bfe)' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  lineHeight: '16px',
                  flexShrink: 0,
                },
              },
              done ? '✓' : '',
            ),
            h('div', { style: { flex: 1, minWidth: 0 } },
              h('div', { style: { fontSize: '13px', fontWeight: 600, textDecoration: done ? 'line-through' : 'none' } }, `【${index + 1}】${task.title}`),
            ),
            goal &&
              h(
                Pill,
                { style: { fontSize: '11px' }, title: goal.title },
                goal.title.length > 8 ? `${goal.title.slice(0, 8)}…` : goal.title,
              ),
          ),
          task.time && h('div', { style: { fontSize: '12px' } }, `⏰ ${task.time}`),
          task.location && h('div', { style: { fontSize: '12px' } }, `📍 ${task.location}`),
          task.detail && h('div', { style: { fontSize: '12px', color: 'var(--dsh-color-text-muted, #8b8e98)' } }, task.detail),
          Array.isArray(task.materials) && task.materials.length > 0 &&
            h('div', { style: { fontSize: '12px' } }, `📦 ${task.materials.join('；')}`),
          Array.isArray(task.steps) && task.steps.length > 0 &&
            h('div', { style: { fontSize: '12px' } }, `🔧 ${task.steps.map((s, i) => `${i + 1}.${s}`).join(' ')}`),
          task.note && h('div', { style: { fontSize: '12px', color: 'var(--dsh-color-warning, #b26a00)' } }, `⚠️ ${task.note}`),
        )
      }),
    ),
    path &&
      h('div', { style: { fontSize: '11px', color: 'var(--dsh-color-text-muted, #8b8e98)', wordBreak: 'break-all' } }, `${t('dataFile')}: ${path}`),
  )
}
