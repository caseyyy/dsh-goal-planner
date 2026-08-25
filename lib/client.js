window.__ModuleLoader__.load({
  id: "dsh-goal-planner",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.jsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react2 = require("react");
var primitives = __toESM(require("@deepseek-ai/dsh-client-ui-primitives"), 1);

// src/client/Panel.jsx
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
var API = "/api/goal-planner";
function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fmtDisplay(d) {
  const weekdays = ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"];
  return `${d.getMonth() + 1}\u6708${d.getDate()}\u65E5 ${weekdays[d.getDay()]}`;
}
function goalOf(document, goalId) {
  return (document?.goals || []).find((g) => g.id === goalId);
}
function Panel({ t }) {
  const [document, setDocument] = (0, import_react.useState)(null);
  const [path, setPath] = (0, import_react.useState)("");
  const [error, setError] = (0, import_react.useState)("");
  const [anchor, setAnchor] = (0, import_react.useState)(() => {
    const d = /* @__PURE__ */ new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const refresh = () => {
    fetch(`${API}/state`).then((r) => r.json()).then((data) => {
      if (data && data.ok) {
        setDocument(data.document);
        setPath(data.path || "");
        setError("");
      } else {
        setError(String(data && data.error || "unknown error"));
      }
    }).catch((e) => setError(String(e && e.message || e)));
  };
  (0, import_react.useEffect)(() => {
    refresh();
  }, []);
  const anchorStr = fmtDate(anchor);
  const dayTasks = (0, import_react.useMemo)(
    () => (document?.tasks || []).filter((task) => task.dueDate === anchorStr).sort((a, b) => a.id.localeCompare(b.id)),
    [document, anchorStr]
  );
  const toggle = (taskId) => {
    fetch(`${API}/toggle`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ taskId })
    }).then((r) => r.json()).then((data) => {
      if (data && data.ok) setDocument(data.document);
      else setError(String(data && data.error || "toggle failed"));
    }).catch((e) => setError(String(e && e.message || e)));
  };
  const shift = (days) => {
    const d = new Date(anchor);
    d.setDate(d.getDate() + days);
    setAnchor(d);
  };
  const isToday = anchorStr === fmtDate(/* @__PURE__ */ new Date());
  const goals = document?.goals || [];
  const allTasks = document?.tasks || [];
  return (0, import_react.createElement)(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "12px", padding: "4px 0 16px" } },
    // Goal overview
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "6px" } },
      goals.length === 0 && (0, import_react.createElement)("div", { style: { color: "var(--dsh-color-text-muted, #8b8e98)", fontSize: "12px" } }, t("goalEmpty")),
      goals.map((goal) => {
        const goalTasks = allTasks.filter((task) => task.goalId === goal.id);
        const doneCount = goalTasks.filter((task) => task.status === "done").length;
        const pct = goalTasks.length === 0 ? 0 : Math.round(doneCount / goalTasks.length * 100);
        return (0, import_react.createElement)(
          "div",
          {
            key: goal.id,
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid var(--dsh-color-border, #e3e5ea)",
              borderRadius: "8px",
              padding: "8px 10px"
            }
          },
          (0, import_react.createElement)(import_dsh_client_ui_primitives.StateDot, { state: doneCount === goalTasks.length && goalTasks.length > 0 ? "done" : "ongoing", size: 8 }),
          (0, import_react.createElement)(
            "div",
            { style: { flex: 1, minWidth: 0 } },
            (0, import_react.createElement)("div", { style: { fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, goal.title),
            (0, import_react.createElement)("div", { style: { fontSize: "11px", color: "var(--dsh-color-text-muted, #8b8e98)" } }, `${t("deadline")} ${goal.deadline || "-"} \xB7 ${doneCount}/${goalTasks.length}`)
          ),
          (0, import_react.createElement)(
            "div",
            { style: { fontSize: "11px", color: "var(--dsh-color-text-muted, #8b8e98)", whiteSpace: "nowrap" } },
            `${pct}%`
          )
        );
      })
    ),
    // Date navigation
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", alignItems: "center", gap: "6px" } },
      (0, import_react.createElement)(
        import_dsh_client_ui_primitives.Button,
        { variant: "ghost", size: "sm", onClick: () => shift(-1), title: "previous" },
        (0, import_react.createElement)(import_dsh_client_ui_primitives.IconChevronLeftOutline14, { size: 14 })
      ),
      (0, import_react.createElement)(
        import_dsh_client_ui_primitives.Button,
        { variant: isToday ? "primary" : "ghost", size: "sm", onClick: () => shift(0) },
        t("today")
      ),
      (0, import_react.createElement)(
        import_dsh_client_ui_primitives.Button,
        { variant: "ghost", size: "sm", onClick: () => shift(1), title: "next" },
        (0, import_react.createElement)(import_dsh_client_ui_primitives.IconChevronRightOutline14, { size: 14 })
      ),
      (0, import_react.createElement)("div", { style: { flex: 1, textAlign: "center", fontSize: "14px", fontWeight: 600 } }, fmtDisplay(anchor)),
      (0, import_react.createElement)(
        import_dsh_client_ui_primitives.Button,
        { variant: "ghost", size: "sm", onClick: refresh, title: t("refresh") },
        (0, import_react.createElement)(import_dsh_client_ui_primitives.IconRefreshOutline14, { size: 14 })
      )
    ),
    error && (0, import_react.createElement)("div", { style: { color: "var(--dsh-color-danger, #d93025)", fontSize: "12px" } }, error),
    // Day tasks
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: "8px" } },
      dayTasks.length === 0 && (0, import_react.createElement)("div", { style: { color: "var(--dsh-color-text-muted, #8b8e98)", fontSize: "12px", padding: "12px 0", textAlign: "center" } }, t("noTasks")),
      dayTasks.map((task, index) => {
        const goal = goalOf(document, task.goalId);
        const done = task.status === "done";
        return (0, import_react.createElement)(
          "div",
          {
            key: task.id,
            style: {
              border: "1px solid var(--dsh-color-border, #e3e5ea)",
              borderRadius: "8px",
              padding: "10px 12px",
              opacity: done ? 0.55 : 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }
          },
          (0, import_react.createElement)(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "8px" } },
            (0, import_react.createElement)(
              "button",
              {
                onClick: () => toggle(task.id),
                title: done ? "mark todo" : "mark done",
                style: {
                  width: "18px",
                  height: "18px",
                  borderRadius: "4px",
                  border: "1px solid var(--dsh-color-border, #c6c9d1)",
                  background: done ? "var(--dsh-color-accent, #4d6bfe)" : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "12px",
                  lineHeight: "16px",
                  flexShrink: 0
                }
              },
              done ? "\u2713" : ""
            ),
            (0, import_react.createElement)(
              "div",
              { style: { flex: 1, minWidth: 0 } },
              (0, import_react.createElement)("div", { style: { fontSize: "13px", fontWeight: 600, textDecoration: done ? "line-through" : "none" } }, `\u3010${index + 1}\u3011${task.title}`)
            ),
            goal && (0, import_react.createElement)(
              import_dsh_client_ui_primitives.Pill,
              { style: { fontSize: "11px" }, title: goal.title },
              goal.title.length > 8 ? `${goal.title.slice(0, 8)}\u2026` : goal.title
            )
          ),
          task.time && (0, import_react.createElement)("div", { style: { fontSize: "12px" } }, `\u23F0 ${task.time}`),
          task.location && (0, import_react.createElement)("div", { style: { fontSize: "12px" } }, `\u{1F4CD} ${task.location}`),
          task.detail && (0, import_react.createElement)("div", { style: { fontSize: "12px", color: "var(--dsh-color-text-muted, #8b8e98)" } }, task.detail),
          Array.isArray(task.materials) && task.materials.length > 0 && (0, import_react.createElement)("div", { style: { fontSize: "12px" } }, `\u{1F4E6} ${task.materials.join("\uFF1B")}`),
          Array.isArray(task.steps) && task.steps.length > 0 && (0, import_react.createElement)("div", { style: { fontSize: "12px" } }, `\u{1F527} ${task.steps.map((s, i) => `${i + 1}.${s}`).join(" ")}`),
          task.note && (0, import_react.createElement)("div", { style: { fontSize: "12px", color: "var(--dsh-color-warning, #b26a00)" } }, `\u26A0\uFE0F ${task.note}`)
        );
      })
    ),
    path && (0, import_react.createElement)("div", { style: { fontSize: "11px", color: "var(--dsh-color-text-muted, #8b8e98)", wordBreak: "break-all" } }, `${t("dataFile")}: ${path}`)
  );
}

// src/client/index.jsx
var name = "dsh-goal-planner";
var REQUIRED_PRIMITIVES = ["Button", "Pill", "StateDot", "IconChevronLeftOutline14", "IconChevronRightOutline14", "IconRefreshOutline14"];
function missingPrimitives(mod) {
  return REQUIRED_PRIMITIVES.filter((key) => mod[key] === void 0);
}
var inject = ["slots", "locale"];
function apply(ctx) {
  const gaps = missingPrimitives(primitives);
  if (gaps.length > 0) {
    console.warn("[dsh-goal-planner] host ui-primitives missing " + gaps.join(", ") + " \u2014 panel disabled (dsh web >= 0.1.0-rc.6 required)");
    return;
  }
  const zh = {
    nav: "\u76EE\u6807\u8BA1\u5212",
    today: "\u4ECA\u5929",
    noGoals: "\u6682\u65E0\u76EE\u6807",
    noTasks: "\u5F53\u65E5\u65E0\u4EFB\u52A1",
    refresh: "\u5237\u65B0",
    deadline: "\u622A\u6B62",
    dataFile: "\u6570\u636E\u6587\u4EF6",
    done: "\u5DF2\u5B8C\u6210",
    goalEmpty: "\u5728\u5BF9\u8BDD\u4E2D\u5BF9\u6211\u8BF4\u300C\u6211\u7684\u76EE\u6807\u662F XXX\uFF0C\u622A\u6B62 YYYY-MM-DD\u300D\uFF0C\u6211\u4F1A\u81EA\u52A8\u62C6\u89E3\u6392\u671F\u5E76\u5199\u5165\u8FD9\u91CC\u3002"
  };
  const en = {
    nav: "Goal Planner",
    today: "Today",
    noGoals: "No goals yet",
    noTasks: "No tasks for this day",
    refresh: "Refresh",
    deadline: "Due",
    dataFile: "Data file",
    done: "Done",
    goalEmpty: 'Tell the agent "my goal is X, due YYYY-MM-DD" and it will decompose and schedule tasks here.'
  };
  ctx.effect(() => ctx.locale.register("dsh-goal-planner", { zh, en }), "dsh-goal-planner: dictionaries");
  const t = ctx.locale.bind("dsh-goal-planner");
  ctx.slots.inject("settings.section", () => {
    const off = ctx.slots.register({
      name: "settings.section",
      id: "goal-planner",
      order: 41,
      label: () => t("nav"),
      locale: "dsh-goal-planner",
      inject: () => ({ t })
    }, () => (0, import_react2.createElement)(Panel, { t }));
    return off;
  });
}

    return module.exports;
  }
});
