<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { createEstimate, loadCatalog } from "./api/client";
import { fallbackCatalog } from "./catalog";
import type { Capability, EstimateRequest, ProjectType, PublicCatalog, PublicEstimate, Urgency } from "./types";

const projectTypes: Array<{ value: ProjectType; label: string; description: string }> = [
  { value: "website", label: "Website", description: "官网、展示站、营销页面" },
  { value: "internal-system", label: "Internal System", description: "后台、内部管理和业务系统" },
  { value: "saas", label: "SaaS", description: "面向多客户的软件服务" },
  { value: "automation", label: "Automation", description: "流程、数据和人工操作自动化" },
  { value: "ai-integration", label: "AI Integration", description: "模型、Agent 与现有业务集成" },
  { value: "existing-system-modification", label: "Existing System", description: "现有系统修改、扩展和迁移" },
  { value: "other", label: "Other", description: "暂时无法归类的需求" },
];

const catalog = ref<PublicCatalog>(fallbackCatalog);
const selectedCapabilities = ref<string[]>([]);
const entityText = ref("");
const entityComplexity = ref<"standard" | "complex">("standard");
const entities = ref<Array<{ name: string; complexityHint: "standard" | "complex" }>>([]);
const loading = ref(false);
const error = ref("");
const estimate = ref<PublicEstimate | null>(null);

const form = reactive({
  projectType: "internal-system" as ProjectType,
  urgency: "normal" as Urgency,
  existingSystem: false,
  unknownApi: false,
  dataMigration: false,
  freeText: "",
});

const groupedCapabilities = computed(() => {
  return catalog.value.categories.map((category) => ({
    ...category,
    capabilities: catalog.value.capabilities.filter((item) => item.category === category.id),
  })).filter((group) => group.capabilities.length > 0);
});

function selectProjectType(projectType: ProjectType) {
  form.projectType = projectType;
  estimate.value = null;
}

function isSelected(code: string) {
  return selectedCapabilities.value.includes(code);
}

function toggleCapability(capability: Capability) {
  selectedCapabilities.value = isSelected(capability.code)
    ? selectedCapabilities.value.filter((code) => code !== capability.code)
    : [...selectedCapabilities.value, capability.code];
  estimate.value = null;
}

function addEntity() {
  const name = entityText.value.trim();
  if (!name) return;
  entities.value = [...entities.value, { name, complexityHint: entityComplexity.value }];
  entityText.value = "";
  entityComplexity.value = "standard";
  estimate.value = null;
}

function removeEntity(index: number) {
  entities.value = entities.value.filter((_, current) => current !== index);
  estimate.value = null;
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

async function submit() {
  error.value = "";
  estimate.value = null;
  loading.value = true;

  const request: EstimateRequest = {
    projectType: form.projectType,
    capabilityCodes: selectedCapabilities.value,
    entities: entities.value,
    delivery: { urgency: form.urgency },
    integrations: {
      existingSystem: form.existingSystem,
      unknownApi: form.unknownApi,
      dataMigration: form.dataMigration,
    },
    freeText: form.freeText.trim(),
  };

  try {
    estimate.value = await createEstimate(request);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "无法生成估算";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  catalog.value = await loadCatalog();
});
</script>

<template>
  <main class="page-shell">
    <header class="hero">
      <div class="eyebrow">CUSTOM DEVELOPMENT / CONFIGURATOR</div>
      <h1>把需求压缩成一个<br /><span>可以讨论的预算。</span></h1>
      <p>
        选择项目形态与需要的能力，再补充实际业务约束。页面只负责收集需求；正式定价规则保留在服务端。
      </p>
    </header>

    <form class="config-grid" @submit.prevent="submit">
      <section class="panel span-7">
        <div class="section-number">01</div>
        <div class="section-heading">
          <h2>项目类型</h2>
          <p>选择最接近的形态，不要求一次描述准确。</p>
        </div>
        <div class="project-grid">
          <button
            v-for="item in projectTypes"
            :key="item.value"
            type="button"
            class="project-option"
            :class="{ selected: form.projectType === item.value }"
            @click="selectProjectType(item.value)"
          >
            <strong>{{ item.label }}</strong>
            <span>{{ item.description }}</span>
          </button>
        </div>
      </section>

      <aside class="panel span-5 sticky-summary">
        <div class="section-number">LIVE</div>
        <div class="section-heading">
          <h2>需求摘要</h2>
          <p>公开页面不保存内部定价权重。</p>
        </div>
        <dl class="summary-list">
          <div><dt>项目类型</dt><dd>{{ projectTypes.find(item => item.value === form.projectType)?.label }}</dd></div>
          <div><dt>能力</dt><dd>{{ selectedCapabilities.length }}</dd></div>
          <div><dt>业务实体</dt><dd>{{ entities.length }}</dd></div>
          <div><dt>交付优先级</dt><dd>{{ form.urgency }}</dd></div>
        </dl>

        <div v-if="estimate" class="estimate-card">
          <span class="estimate-label">ESTIMATED RANGE</span>
          <strong>{{ money(estimate.range.min, estimate.currency) }} – {{ money(estimate.range.max, estimate.currency) }}</strong>
          <div class="likely">当前参考 {{ money(estimate.range.likely, estimate.currency) }}</div>
          <div class="confidence">估算置信度 {{ Math.round(estimate.confidence * 100) }}%</div>
          <ul v-if="estimate.explanation.length">
            <li v-for="item in estimate.explanation" :key="item">{{ item }}</li>
          </ul>
          <p v-if="estimate.requiresReview" class="review-note">当前需求需要人工复核后才能进入正式报价。</p>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>
        <button class="primary-action" type="submit" :disabled="loading">
          {{ loading ? "CALCULATING…" : "获取预算估算" }}
        </button>
        <p class="fine-print">Estimate 仅用于预算参考；最终 Quote 将由服务端重新校验并冻结价格快照。</p>
      </aside>

      <section class="panel span-12">
        <div class="section-number">02</div>
        <div class="section-heading">
          <h2>能力选择</h2>
          <p>这里只公开能力代码和说明，不公开每项的内部价格权重。</p>
        </div>
        <div v-for="group in groupedCapabilities" :key="group.id" class="capability-group">
          <h3>{{ group.label }}</h3>
          <div class="capability-grid">
            <button
              v-for="capability in group.capabilities"
              :key="capability.code"
              type="button"
              class="capability"
              :class="{ selected: isSelected(capability.code) }"
              @click="toggleCapability(capability)"
            >
              <span class="capability-check">{{ isSelected(capability.code) ? "×" : "+" }}</span>
              <span><strong>{{ capability.label }}</strong><small>{{ capability.description }}</small></span>
            </button>
          </div>
        </div>
      </section>

      <section class="panel span-6">
        <div class="section-number">03</div>
        <div class="section-heading">
          <h2>业务对象</h2>
          <p>例如客户、商品、订单、库存记录。复杂对象包含更多状态和关联。</p>
        </div>
        <div class="entity-entry">
          <input v-model="entityText" placeholder="例如：订单" @keydown.enter.prevent="addEntity" />
          <select v-model="entityComplexity">
            <option value="standard">标准</option>
            <option value="complex">复杂</option>
          </select>
          <button type="button" @click="addEntity">ADD</button>
        </div>
        <div class="entity-list">
          <button v-for="(entity, index) in entities" :key="`${entity.name}-${index}`" type="button" @click="removeEntity(index)">
            {{ entity.name }} / {{ entity.complexityHint === "complex" ? "复杂" : "标准" }} ×
          </button>
          <span v-if="!entities.length" class="empty-state">尚未添加业务对象</span>
        </div>
      </section>

      <section class="panel span-6">
        <div class="section-number">04</div>
        <div class="section-heading">
          <h2>既有环境与交付</h2>
          <p>这些信息主要影响未知风险和集成工作量。</p>
        </div>
        <div class="check-list">
          <label><input v-model="form.existingSystem" type="checkbox" /> 需要接入已有系统</label>
          <label><input v-model="form.unknownApi" type="checkbox" /> 外部 API 状态 / 文档不明确</label>
          <label><input v-model="form.dataMigration" type="checkbox" /> 存在历史数据迁移</label>
        </div>
        <label class="field-label" for="urgency">交付优先级</label>
        <select id="urgency" v-model="form.urgency" class="full-select">
          <option value="normal">Normal / 正常排期</option>
          <option value="priority">Priority / 优先排期</option>
          <option value="rush">Rush / 加急</option>
          <option value="critical">Critical / 紧急</option>
        </select>
      </section>

      <section class="panel span-12">
        <div class="section-number">05</div>
        <div class="section-heading">
          <h2>自由描述</h2>
          <p>说明目标、当前流程、人工成本和希望被自动化的部分。后续 AI 分析器将从这里提取结构化需求。</p>
        </div>
        <textarea v-model="form.freeText" rows="7" placeholder="例如：目前每天需要两个人手工处理订单，希望把录入、状态通知和统计整合到一个后台……"></textarea>
      </section>
    </form>
  </main>
</template>
