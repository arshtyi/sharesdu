import { mount } from '@vue/test-utils';
import ItemTypeTabs from '@/pages/index/pc/components/ItemTypeTabs.vue';

describe('PC 首页内容类型页签', () => {
  const mountTabs = (modelValue = 'article') => mount(ItemTypeTabs, {
    props: {
      modelValue,
      ifMobile: false,
      themeColor: '#9c0c13',
    },
  });

  test('展示文章、帖子、课程、板块和微服务五种内容', () => {
    const wrapper = mountTabs();

    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual([
      '文章',
      '帖子',
      '课程',
      '板块',
      '微服务',
    ]);
  });

  test('点击微服务只触发一次类型更新', async () => {
    const wrapper = mountTabs();

    await wrapper.findAll('[role="tab"]')[4].trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([['service']]);
  });

  test('通过 aria-selected 标记当前页签', () => {
    const wrapper = mountTabs('section');
    const selectedTabs = wrapper.findAll('[role="tab"][aria-selected="true"]');

    expect(selectedTabs).toHaveLength(1);
    expect(selectedTabs[0].text()).toBe('板块');
  });
});
