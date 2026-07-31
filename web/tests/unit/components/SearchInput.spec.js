import { mount } from '@vue/test-utils';
import SearchInput from '@/components/common/searchInput/SearchInput.vue';

jest.mock('@/components/common/searchInput/utils/HistoryCard.vue', () => ({
  name: 'HistoryCard',
  template: '<div />',
}));

jest.mock('@/components/common/searchInput/utils/RecommendCard.vue', () => ({
  name: 'RecommendCard',
  template: '<div />',
}));

describe('SearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('按 Enter 时只提交一次搜索', async () => {
    const wrapper = mount(SearchInput, {
      props: {
        modelValue: '测试内容',
      },
      global: {
        stubs: {
          HistoryCard: true,
          RecommendCard: true,
        },
      },
    });

    await wrapper.find('input').trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('submit')).toHaveLength(1);
    wrapper.unmount();
  });

  test('仅在搜索框聚焦时显示搜索建议', async () => {
    const wrapper = mount(SearchInput, {
      global: {
        stubs: {
          HistoryCard: true,
          RecommendCard: true,
        },
      },
    });
    const input = wrapper.find('input');
    const suggestions = wrapper.find('.suggestion-container');

    expect(suggestions.isVisible()).toBe(false);

    await input.trigger('focus');
    expect(suggestions.isVisible()).toBe(true);

    await input.trigger('blur');
    expect(suggestions.isVisible()).toBe(false);
    wrapper.unmount();
  });

  test('提交搜索后隐藏建议并在继续输入时重新显示', async () => {
    const wrapper = mount(SearchInput, {
      props: {
        modelValue: '测试内容',
      },
      global: {
        stubs: {
          HistoryCard: true,
          RecommendCard: true,
        },
      },
    });
    const input = wrapper.find('input');
    const suggestions = wrapper.find('.suggestion-container');

    await input.trigger('focus');
    await input.trigger('keydown', { key: 'Enter' });
    expect(suggestions.isVisible()).toBe(false);

    await input.setValue('新的内容');
    expect(suggestions.isVisible()).toBe(true);
    wrapper.unmount();
  });

  test('输入其他按键时不提交搜索', async () => {
    const wrapper = mount(SearchInput, {
      global: {
        stubs: {
          HistoryCard: true,
          RecommendCard: true,
        },
      },
    });

    await wrapper.find('input').trigger('keydown', { key: 'a' });

    expect(wrapper.emitted('submit')).toBeUndefined();
    wrapper.unmount();
  });
});
