import { runToolLoop } from '@/agent/runToolLoop';

const tool = {
  type: 'function',
  function: {
    name: 'lookup',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
      additionalProperties: false,
    },
  },
};

describe('runToolLoop', () => {
  test('rejects invalid tool arguments before calling the handler', async () => {
    const handler = jest.fn();
    const createChatCompletion = jest
      .fn()
      .mockResolvedValueOnce({
        choices: [{ message: { role: 'assistant', content: '', tool_calls: [{ id: '1', function: { name: 'lookup', arguments: '{}' } }] } }],
        usage: { total_tokens: 10 },
      })
      .mockResolvedValueOnce({ choices: [{ message: { role: 'assistant', content: '完成' } }], usage: { total_tokens: 10 } });

    const result = await runToolLoop({
      client: { createChatCompletion },
      model: 'test',
      messages: [],
      tools: [tool],
      handlers: { lookup: handler },
    });

    expect(handler).not.toHaveBeenCalled();
    expect(result.final.content).toBe('完成');
    const toolMessage = JSON.parse(createChatCompletion.mock.calls[1][0].messages.find((message) => message.role === 'tool').content);
    expect(toolMessage.result.error).toBe('invalid_tool_arguments');
  });

  test('runs independent tool calls with limited concurrency and sanitizes HTML', async () => {
    let calls = 0;
    const createChatCompletion = jest.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return {
          choices: [{ message: { role: 'assistant', content: '', tool_calls: [
            { id: '1', function: { name: 'lookup', arguments: '{"query":"a"}' } },
            { id: '2', function: { name: 'lookup', arguments: '{"query":"b"}' } },
          ] } }],
          usage: { total_tokens: 10 },
        };
      }
      return { choices: [{ message: { role: 'assistant', content: '完成' } }], usage: { total_tokens: 10 } };
    });
    const handler = jest.fn(async ({ query }) => ({ ok: true, data: `<b>${query}</b><script>bad()</script>` }));

    await runToolLoop({
      client: { createChatCompletion },
      model: 'test',
      messages: [],
      tools: [tool],
      handlers: { lookup: handler },
      toolConcurrency: 2,
    });

    expect(handler).toHaveBeenCalledTimes(2);
    const toolMessages = createChatCompletion.mock.calls[1][0].messages.filter((message) => message.role === 'tool');
    expect(toolMessages).toHaveLength(2);
    expect(toolMessages[0].content).not.toContain('<script>');
    expect(toolMessages[0].content).toContain('不可信站内数据');
  });

  test('validates tool results with JSON Schema before adding them to context', async () => {
    const createChatCompletion = jest
      .fn()
      .mockResolvedValueOnce({
        choices: [{ message: { role: 'assistant', content: '', tool_calls: [{ id: '1', function: { name: 'lookup', arguments: '{"query":"a"}' } }] } }],
        usage: { total_tokens: 10 },
      })
      .mockResolvedValueOnce({ choices: [{ message: { role: 'assistant', content: '完成' } }], usage: { total_tokens: 10 } });

    await runToolLoop({
      client: { createChatCompletion },
      model: 'test',
      messages: [],
      tools: [tool],
      handlers: { lookup: async () => ({ data: 'missing ok' }) },
    });

    const toolMessage = JSON.parse(createChatCompletion.mock.calls[1][0].messages.find((message) => message.role === 'tool').content);
    expect(toolMessage.result.ok).toBe(false);
    expect(toolMessage.result.error).toBe('invalid_tool_result_shape');
    expect(toolMessage.result.details).toEqual(expect.any(Array));
  });
});
