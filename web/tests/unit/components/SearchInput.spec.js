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
