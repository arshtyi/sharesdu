import { mount } from '@vue/test-utils';
import {
  SharesduSvgIcon,
  sharesduIconPaths,
  sharesduMdiAliases,
} from '@/plugins/sharesduMdi';

describe('SharesduSvgIcon', () => {
  test('renders a mapped MDI icon as an SVG path', () => {
    const wrapper = mount(SharesduSvgIcon, {
      props: { tag: 'i', icon: 'mdi-home' },
    });

    expect(wrapper.element.tagName).toBe('I');
    expect(wrapper.find('svg.v-icon__svg').exists()).toBe(true);
    expect(wrapper.find('path').attributes('d')).toBe(sharesduIconPaths['mdi-home']);
  });

  test('preserves Vuetify color and size styles on the icon root', () => {
    const wrapper = mount(SharesduSvgIcon, {
      props: { tag: 'i', icon: 'mdi-home' },
      attrs: {
        style: {
          color: 'rgb(156, 12, 19)',
          width: '32px',
          height: '32px',
          fontSize: '32px',
        },
      },
    });

    expect(wrapper.element.style.color).toBe('rgb(156, 12, 19)');
    expect(wrapper.element.style.width).toBe('32px');
    expect(wrapper.element.style.height).toBe('32px');
    expect(wrapper.find('svg').attributes('fill')).toBe('currentColor');
  });

  test.each(['radioOn', 'radioOff', 'checkboxOn', 'checkboxOff', 'ratingFull', 'ratingEmpty', 'dropdown'])(
    'provides an SVG alias for Vuetify internal icon %s',
    (alias) => {
      expect(sharesduMdiAliases[alias]).toMatch(/^svg:/);
    },
  );
});
