<template>
  <v-dialog
    v-model="visible"
    max-width="560"
    persistent
    content-class="agent-config-dialog"
    @after-enter="syncDraft"
  >
    <v-card class="pa-4">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-robot-outline" class="mr-2" />
        {{ title }}
        <v-spacer />
        <v-btn aria-label="关闭 Agent 设置" icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>
      <v-card-text>
        <div class="text-small mb-3" style="color: #6b6b6b;">
          {{ description }}
        </div>
        <div class="text-small mb-3" style="color: #8a8a8a;">
          默认值已提高，低频参数收进高级配置。
        </div>
        <v-radio-group v-model="draft.storageMode" inline label="API Key 保存方式" density="compact">
          <v-radio label="仅本次会话" value="session" />
          <v-radio label="浏览器持久保存" value="local" />
        </v-radio-group>
        <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
          你填写的任意自定义 Base URL 都会收到此 API Key。请只使用可信服务地址。
        </v-alert>
        <v-text-field
          v-model="draft.baseUrl"
          label="Base URL（OpenAI兼容）"
          density="compact"
          variant="outlined"
          placeholder="https://api.openai.com/v1"
        />
        <v-autocomplete
          v-model="draft.model"
          :items="modelOptions"
          label="Model"
          density="compact"
          variant="outlined"
          placeholder="gpt-4o"
          clearable
        />
        <v-text-field
          v-model="draft.apiKey"
          :type="showApiKey ? 'text' : 'password'"
          label="API Key"
          density="compact"
          variant="outlined"
          placeholder="sk-..."
          :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showApiKey = !showApiKey"
        />
        <div class="text-small mt-1 mb-1" style="color: #6b6b6b;">Temperature: {{ draft.temperature }}</div>
        <v-slider
          v-model="draft.temperature"
          :min="0"
          :max="1"
          :step="0.05"
          density="compact"
          color="var(--theme-color)"
        />
        <div class="connection-row mb-3">
          <v-btn :loading="testing" variant="outlined" color="var(--theme-color)" @click="testConnection">
            测试连接与工具调用
          </v-btn>
          <span v-if="testMessage" class="text-small" :class="testOk ? 'test-ok' : 'test-error'">{{ testMessage }}</span>
        </div>
        <v-text-field
          v-model.number="draft.maxRounds"
          label="Max Rounds（工具调用最大轮数）"
          density="compact"
          variant="outlined"
          type="number"
          :min="1"
          :max="AGENT_LLM_LIMITS.maxRounds"
          hint="单次对话中 LLM 可进行工具调用的最大轮数"
          persistent-hint
        />
        <v-text-field
          v-model.number="draft.contextTurns"
          label="上下文记忆轮数"
          density="compact"
          variant="outlined"
          type="number"
          :min="0"
          :max="AGENT_LLM_LIMITS.contextTurns"
          hint="请求时携带最近 n 轮（用户+助手）对话；0 表示不携带历史"
          persistent-hint
        />
        <v-expansion-panels
          v-model="advancedOpen"
          class="agent-config-advanced"
          variant="accordion"
        >
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex flex-column">
                <span>高级配置</span>
                <span class="text-caption" style="color: #8a8a8a;">低频参数、预算与记忆策略</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-text-field
                v-model.number="draft.maxTokens"
                label="Max Tokens"
                density="compact"
                variant="outlined"
                type="number"
                :min="64"
                :max="AGENT_LLM_LIMITS.maxTokens"
                hint="默认 32k，适合更长回答或更复杂的工具调用"
                persistent-hint
              />
              <v-text-field
                v-model.number="draft.maxToolCalls"
                label="单轮工具调用总数上限"
                density="compact"
                variant="outlined"
                type="number"
                :min="1"
                :max="AGENT_LLM_LIMITS.maxToolCalls"
              />
              <v-text-field
                v-model.number="draft.maxTotalTokens"
                label="总 Token 预算"
                density="compact"
                variant="outlined"
                type="number"
                :min="512"
                :max="AGENT_LLM_LIMITS.maxTotalTokens"
              />
              <v-text-field
                v-model.number="draft.maxTotalMs"
                label="最大总耗时（毫秒）"
                density="compact"
                variant="outlined"
                type="number"
                :min="10000"
                :max="AGENT_LLM_LIMITS.maxTotalMs"
              />
              <v-text-field
                v-model.number="draft.maxToolResultBytes"
                label="工具结果回灌总字节上限"
                density="compact"
                variant="outlined"
                type="number"
                :min="4096"
                :max="AGENT_LLM_LIMITS.maxToolResultBytes"
              />
              <v-text-field
                v-model.number="draft.toolTimeoutMs"
                label="单个工具超时（毫秒）"
                density="compact"
                variant="outlined"
                type="number"
                :min="1000"
                :max="AGENT_LLM_LIMITS.toolTimeoutMs"
              />
              <v-text-field
                v-model.number="draft.toolConcurrency"
                label="工具并发数"
                density="compact"
                variant="outlined"
                type="number"
                :min="1"
                :max="AGENT_LLM_LIMITS.toolConcurrency"
              />
              <v-switch
                v-model="draft.structuredMemory"
                label="启用结构化记忆"
                density="compact"
                inset
                color="var(--theme-color)"
              />
              <v-text-field
                v-model.number="draft.memoryNotesLimit"
                label="记忆备注保留数"
                density="compact"
                variant="outlined"
                type="number"
                :min="0"
                :max="AGENT_LLM_LIMITS.memoryNotesLimit"
                hint="会话记忆中保留多少条备注，过多会影响提示词长度"
                persistent-hint
              />
              <v-text-field
                v-model.number="draft.memoryEntityLimit"
                label="已确认实体上限"
                density="compact"
                variant="outlined"
                type="number"
                :min="0"
                :max="AGENT_LLM_LIMITS.memoryEntityLimit"
                hint="结构化记忆里保留多少个已确认实体"
                persistent-hint
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <div class="row-actions mt-3">
          <v-btn color="var(--theme-color)" variant="flat" @click="handleSave">{{ saveText }}</v-btn>
          <v-btn color="grey" variant="outlined" @click="handleReset">{{ resetText }}</v-btn>
          <v-btn
            v-if="showGoToAgent"
            color="grey"
            variant="tonal"
            @click="handleGoToAgent"
          >
            {{ goToAgentText }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { AGENT_LLM_LIMITS, getDefaultAgentLLMConfig, normalizeAgentLLMConfig, validateAgentLLMConfig } from '@/agent/config';
import { createOpenAICompatibleClient } from '@/agent/llm/openaiCompatible';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  config: {
    type: Object,
    default: () => getDefaultAgentLLMConfig(),
  },
  title: {
    type: String,
    default: 'Agent 模型配置（本地存储）',
  },
  description: {
    type: String,
    default: '网站不提供 Key；请自行填写。配置仅保存在浏览器本地（LocalStorage）。',
  },
  saveText: {
    type: String,
    default: '保存',
  },
  resetText: {
    type: String,
    default: '重置为默认',
  },
  showGoToAgent: {
    type: Boolean,
    default: false,
  },
  goToAgentText: {
    type: String,
    default: '前往对话',
  },
});

const emit = defineEmits(['update:modelValue', 'save', 'reset', 'go-to-agent']);

const visible = computed({
  get: () => props.modelValue,
  set: (next) => emit('update:modelValue', !!next),
});
const showApiKey = ref(false);
const advancedOpen = ref([]);
const testing = ref(false);
const testMessage = ref('');
const testOk = ref(false);
const modelOptions = ref([]);
const draft = reactive({ ...getDefaultAgentLLMConfig() });

const syncDraft = () => {
  const next = normalizeAgentLLMConfig(props.config || {});
  Object.assign(draft, next);
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      syncDraft();
      advancedOpen.value = [];
    } else {
      showApiKey.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => props.config,
  () => {
    if (props.modelValue) syncDraft();
  },
  { deep: true }
);

const close = () => {
  visible.value = false;
};

const handleSave = () => {
  const next = normalizeAgentLLMConfig(draft);
  emit('save', next);
};

const handleReset = () => {
  emit('reset');
};

const testConnection = async () => {
  const config = normalizeAgentLLMConfig(draft);
  const validation = validateAgentLLMConfig(config);
  if (!validation.ok) {
    testOk.value = false;
    testMessage.value = '请先填写 Base URL、Model 和 API Key';
    return;
  }
  testing.value = true;
  testMessage.value = '';
  try {
    const client = createOpenAICompatibleClient(config);
    const models = await client.listModels();
    modelOptions.value = models.map((item) => item?.id).filter(Boolean);
    const response = await client.createChatCompletion({
      model: config.model,
      messages: [{ role: 'user', content: '请调用 sharesdu_connection_probe 工具，不要直接回答。' }],
      tools: [{
        type: 'function',
        function: {
          name: 'sharesdu_connection_probe',
          description: '连接测试工具',
          parameters: { type: 'object', properties: {}, additionalProperties: false },
        },
      }],
      tool_choice: 'auto',
      temperature: 0,
      max_tokens: 64,
    });
    const supportsTools = Boolean(response?.choices?.[0]?.message?.tool_calls?.length);
    testOk.value = supportsTools;
    testMessage.value = supportsTools
      ? `连接正常，支持工具调用；发现 ${modelOptions.value.length} 个模型`
      : `连接正常，但当前模型未返回工具调用；发现 ${modelOptions.value.length} 个模型`;
  } catch (error) {
    testOk.value = false;
    testMessage.value = `测试失败：${error?.message || 'unknown_error'}`;
  } finally {
    testing.value = false;
  }
};

const handleGoToAgent = () => {
  emit('go-to-agent');
  close();
};
</script>

<style scoped>
.agent-config-advanced {
  margin-top: 6px;
}

.connection-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.test-ok { color: var(--color-success); }
.test-error { color: var(--color-error); }
</style>
