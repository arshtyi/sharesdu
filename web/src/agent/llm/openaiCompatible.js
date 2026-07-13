const normalizeBaseUrl = (baseUrl) => {
  const trimmed = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (trimmed.endsWith('/v1')) return trimmed;
  return `${trimmed}/v1`;
};

const createHttpError = async (res) => {
  const text = await res.text().catch(() => '');
  const error = new Error(`LLM request failed: ${res.status} ${res.statusText}`);
  error.status = res.status;
  error.body = text.slice(0, 4096);
  return error;
};

const parseEventStream = async (res, onDelta) => {
  if (!res.body?.getReader) return res.json();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const message = { role: 'assistant', content: '' };
  const toolCalls = new Map();
  let buffer = '';
  let finishReason = null;
  let usage;

  const consumeData = (data) => {
    if (!data || data === '[DONE]') return;
    let chunk;
    try {
      chunk = JSON.parse(data);
    } catch {
      return;
    }
    usage = chunk.usage || usage;
    const choice = chunk.choices?.[0];
    if (!choice) return;
    finishReason = choice.finish_reason || finishReason;
    const delta = choice.delta || {};
    if (typeof delta.content === 'string') {
      message.content += delta.content;
      onDelta?.({ content: delta.content, accumulated: message.content });
    }
    for (const part of delta.tool_calls || []) {
      const index = Number.isInteger(part.index) ? part.index : toolCalls.size;
      const current = toolCalls.get(index) || {
        id: '',
        type: 'function',
        function: { name: '', arguments: '' },
      };
      if (part.id) current.id += part.id;
      if (part.type) current.type = part.type;
      if (part.function?.name) current.function.name += part.function.name;
      if (part.function?.arguments) current.function.arguments += part.function.arguments;
      toolCalls.set(index, current);
    }
  };

  const consumeBlock = (block) => {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');
    consumeData(data);
  };

  let streamDone = false;
  while (!streamDone) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() || '';
    blocks.forEach(consumeBlock);
    streamDone = done;
  }
  if (buffer.trim()) consumeBlock(buffer);
  if (toolCalls.size) message.tool_calls = [...toolCalls.entries()].sort(([a], [b]) => a - b).map(([, call]) => call);
  return { choices: [{ message, finish_reason: finishReason }], usage };
};

export const createOpenAICompatibleClient = ({ baseUrl, apiKey }) => {
  const normalized = normalizeBaseUrl(baseUrl);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  const createChatCompletion = async ({ stream = false, onDelta, signal, ...payload }) => {
    const res = await fetch(`${normalized}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...payload, stream }),
      signal,
    });
    if (!res.ok) throw await createHttpError(res);
    const contentType = res.headers.get('content-type') || '';
    if (stream && contentType.includes('text/event-stream')) {
      return parseEventStream(res, onDelta);
    }
    return res.json();
  };

  const listModels = async ({ signal } = {}) => {
    const res = await fetch(`${normalized}/models`, { headers, signal });
    if (!res.ok) throw await createHttpError(res);
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  };

  return { createChatCompletion, listModels };
};
