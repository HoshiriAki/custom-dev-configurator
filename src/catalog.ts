import type { PublicCatalog } from "./types";

// Public labels only. There are intentionally no prices, PU weights, multipliers,
// discount limits, or margin rules in this repository.
export const fallbackCatalog: PublicCatalog = {
  version: "public-fallback-0.1",
  categories: [
    { id: "identity", label: "身份与权限" },
    { id: "business", label: "业务能力" },
    { id: "integration", label: "集成" },
    { id: "data", label: "数据与分析" },
    { id: "ai", label: "AI" },
  ],
  capabilities: [
    { code: "auth.basic", label: "登录 / 注册", description: "基础账号身份认证", category: "identity" },
    { code: "auth.rbac", label: "角色权限", description: "多角色权限与访问控制", category: "identity" },
    { code: "audit.basic", label: "审计日志", description: "关键操作与状态变化留痕", category: "business" },
    { code: "workflow.state-machine", label: "业务工作流", description: "状态机、审批与流程推进", category: "business" },
    { code: "dashboard", label: "仪表盘", description: "关键数据总览与业务指标", category: "data" },
    { code: "reporting", label: "报表", description: "业务统计、筛选与导出", category: "data" },
    { code: "integration.webhook", label: "Webhook", description: "与外部系统进行事件联动", category: "integration" },
    { code: "integration.payment", label: "支付接入", description: "支付会话与可信回调链路", category: "integration" },
    { code: "notify.wechat", label: "微信通知", description: "微信侧消息通知或客户接入", category: "integration" },
    { code: "multi-tenant", label: "多租户", description: "多个组织的数据与权限隔离", category: "business" },
    { code: "ai.integration", label: "AI 集成", description: "模型 API 与业务流程集成", category: "ai" },
    { code: "ai.agent", label: "AI Agent", description: "具备工具调用和工作流能力的智能体", category: "ai" }
  ]
};
