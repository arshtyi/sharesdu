import { getRouteViewKey } from '@/app/composables/useRouteState';

describe('getRouteViewKey', () => {
  test('搜索关键词变化时更新结果页 key', () => {
    const firstSearchKey = getRouteViewKey({
      name: 'SearchPage',
      params: {},
      fullPath: '/search?type=all&query=first',
    });
    const secondSearchKey = getRouteViewKey({
      name: 'SearchPage',
      params: {},
      fullPath: '/search?type=all&query=second',
    });

    expect(secondSearchKey).not.toBe(firstSearchKey);
  });

  test('调试模式下搜索关键词变化时同样更新结果页 key', () => {
    const firstSearchKey = getRouteViewKey({
      name: 'SearchPageDebug',
      params: {},
      fullPath: '/debug/search?type=all&query=first',
    });
    const secondSearchKey = getRouteViewKey({
      name: 'SearchPageDebug',
      params: {},
      fullPath: '/debug/search?type=all&query=second',
    });

    expect(secondSearchKey).not.toBe(firstSearchKey);
  });

  test('其他页面仅修改查询参数时继续复用页面实例', () => {
    const firstKey = getRouteViewKey({
      name: 'SelfPage',
      params: {},
      fullPath: '/self?tab=profile',
    });
    const secondKey = getRouteViewKey({
      name: 'SelfPage',
      params: {},
      fullPath: '/self?tab=notification',
    });

    expect(secondKey).toBe(firstKey);
  });
});
