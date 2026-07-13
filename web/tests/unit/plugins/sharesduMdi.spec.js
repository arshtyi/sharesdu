import { mount } from '@vue/test-utils';
import { SharesduSvgIcon, sharesduIconPaths } from '@/plugins/sharesduMdi';

describe('SharesduSvgIcon', () => {
  test('renders a mapped MDI icon as an SVG path', () => {
    const wrapper = mount(SharesduSvgIcon, {
      props: { tag: 'i', icon: 'mdi-home' },
    });

    expect(wrapper.element.tagName).toBe('I');
    expect(wrapper.find('svg.v-icon__svg').exists()).toBe(true);
    expect(wrapper.find('path').attributes('d')).toBe(sharesduIconPaths['mdi-home']);
  });
});
