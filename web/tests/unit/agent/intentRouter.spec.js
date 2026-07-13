import { routeIntentByRule } from '@/agent/agents/intentRouterAgent';

describe('Agent intent fast path', () => {
  test('routes course questions without an LLM call', () => {
    expect(routeIntentByRule('帮我找一下高等数学课程和老师给分')).toEqual({
      intents: ['site_query'],
      domain: 'course',
    });
  });

  test('supports independent docs and query branches', () => {
    expect(routeIntentByRule('课程数据会涉及本站隐私政策吗')).toEqual({
      intents: ['site_docs', 'site_query'],
      domain: 'course',
    });
  });

  test('leaves ambiguous prompts to the LLM router', () => {
    expect(routeIntentByRule('你好')).toBeNull();
  });
});
