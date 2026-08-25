# dsh-goal-planner

目标驱动的每日任务计划器（DeepSeek Harness 插件）：多目标任务数据 + Web 端「目标计划」预览面板，与微信提醒推送链路共享同一份数据文件。

Goal-driven daily task planner for DeepSeek Harness: multi-goal task data + a daily preview panel in the Web GUI, sharing one data file with the WeChat reminder pipeline.

## 功能 / Features

- 🎯 **多目标**：`goals[]` 支持并行多个目标（每个目标独立截止日期），新目标不覆盖旧目标
- 📅 **每日预览**：设置 → **目标计划** 面板，按日期翻页查看每一天的任务（时间/地点/材料/步骤/注意）
- ✅ **一键完成**：面板里直接勾选任务完成/恢复，数据即时落盘
- 🔌 **与推送链路共享数据**：`tasksPath` 配置指向现有 `tasks.json`，即可与 `push-daily.mjs` + `dsh-automation` 的每晚微信推送共用同一份数据
- 🔒 **Loopback 安全**：HTTP API 仅允许 127.0.0.1 访问

## 数据模型 / Data model

```json
{
  "updatedAt": "2026-08-24",
  "goals": [
    { "id": "G1", "title": "给宝宝办齐证件", "deadline": "2026-09-12", "note": "背景备注（可选）" }
  ],
  "tasks": [
    {
      "id": "T01",
      "goalId": "G1",
      "title": "任务标题",
      "detail": "做什么、做到什么程度算完成",
      "time": "具体时间/时段",
      "location": "地点/线上入口",
      "materials": ["要准备的材料"],
      "steps": ["步骤 1"],
      "note": "注意事项",
      "dueDate": "2026-08-25",
      "status": "todo | doing | done"
    }
  ]
}
```

## 安装 / Install

```sh
dsh plugin --profile web add github:caseyyy/dsh-goal-planner
# 或本地开发：
dsh plugin --profile web add link:D:/path/to/dsh-goal-planner -w
```

重启 `dsh web` 后，设置页左侧出现 **目标计划** 入口。

### 指向已有数据文件

在 profile 的 `cordis.patch.yml` 中覆盖配置：

```yaml
- id: goal-planner
  config:
    tasksPath: 'D:\\HarnessWorkbench\\goals\\tasks.json'
```

留空则使用 `$DSH_HOME/dsh-goal-planner/tasks.json`。

## HTTP API（loopback only）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/goal-planner/state` | 返回 `{ ok, path, document }` |
| POST | `/api/goal-planner/save` | 整体保存文档（结构校验） |
| POST | `/api/goal-planner/toggle` | `{ taskId }` 翻转 todo ↔ done |

## 与提醒链路配合

典型组合（作者自用）：

- **拆解排期**：对话中告诉 agent「我的目标是 XXX，截止 YYYY-MM-DD」→ agent 搜索步骤/材料并写入本插件的数据文件
- **每日微信推送**：`dsh-automation` 规则每天 20:30 运行 `node push-daily.mjs`，把「明天」到期任务经 Server酱 推送到微信
- **随时预览**：本插件面板按天翻看任务

## 开发 / Development

```sh
npm install        # 仅需 esbuild
npm run build      # lib/index.js + lib/client.js
```

- Host 端 `src/index.js`：数据读写 + HTTP 路由（`ctx.inject(['webServer'])`）
- Client 端 `src/client/*`：React 面板，external 依赖宿主平台模块表

## License

MIT
