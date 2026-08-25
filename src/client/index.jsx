/**
 * dsh-goal-planner client entry: registers the 「目标计划」 settings section
 * rendering the daily task preview panel. Built by esbuild into
 * lib/client.js; externals resolve from the host's platform module table
 * (react / react-dom / @deepseek-ai/* client services and primitives).
 */
import { createElement as h } from 'react'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import { Panel } from './Panel.jsx'

export const name = 'dsh-goal-planner'

const REQUIRED_PRIMITIVES = ['Button', 'Pill', 'StateDot', 'IconChevronLeftOutline14', 'IconChevronRightOutline14', 'IconRefreshOutline14']

function missingPrimitives(mod) {
  return REQUIRED_PRIMITIVES.filter((key) => mod[key] === undefined)
}

export const inject = ['slots', 'locale']

export function apply(ctx) {
  const gaps = missingPrimitives(primitives)
  if (gaps.length > 0) {
    console.warn('[dsh-goal-planner] host ui-primitives missing ' + gaps.join(', ') + ' — panel disabled (dsh web >= 0.1.0-rc.6 required)')
    return
  }

  const zh = {
    nav: '目标计划',
    today: '今天',
    noGoals: '暂无目标',
    noTasks: '当日无任务',
    refresh: '刷新',
    deadline: '截止',
    dataFile: '数据文件',
    done: '已完成',
    goalEmpty: '在对话中对我说「我的目标是 XXX，截止 YYYY-MM-DD」，我会自动拆解排期并写入这里。',
  }
  const en = {
    nav: 'Goal Planner',
    today: 'Today',
    noGoals: 'No goals yet',
    noTasks: 'No tasks for this day',
    refresh: 'Refresh',
    deadline: 'Due',
    dataFile: 'Data file',
    done: 'Done',
    goalEmpty: 'Tell the agent "my goal is X, due YYYY-MM-DD" and it will decompose and schedule tasks here.',
  }

  ctx.effect(() => ctx.locale.register('dsh-goal-planner', { zh, en }), 'dsh-goal-planner: dictionaries')
  const t = ctx.locale.bind('dsh-goal-planner')

  ctx.slots.inject('settings.section', () => {
    const off = ctx.slots.register({
      name: 'settings.section',
      id: 'goal-planner',
      order: 41,
      label: () => t('nav'),
      locale: 'dsh-goal-planner',
      inject: () => ({ t }),
    }, () => h(Panel, { t }))
    return off
  })
}
