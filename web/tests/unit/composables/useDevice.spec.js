import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { deviceTypeState, useDevice } from '@/app/composables/useDevice';

const DeviceProbe = defineComponent({
  name: 'DeviceProbe',
  setup() {
    return useDevice();
  },
  template: '<span>{{ deviceType }}:{{ ifMobile }}</span>',
});

const setViewportWidth = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
};

const flushDeviceUpdate = async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  await nextTick();
};

describe('useDevice', () => {
  beforeEach(() => {
    setViewportWidth(1440);
    deviceTypeState.value = 'desktop';
  });

  test('updates all consumers after resize without remounting', async () => {
    const first = mount(DeviceProbe);
    const second = mount(DeviceProbe);
    expect(first.text()).toBe('desktop:false');
    expect(second.text()).toBe('desktop:false');

    setViewportWidth(390);
    window.dispatchEvent(new Event('resize'));
    await flushDeviceUpdate();

    expect(first.text()).toBe('mobile:true');
    expect(second.text()).toBe('mobile:true');

    first.unmount();
    second.unmount();
  });

  test('responds to orientation changes', async () => {
    const wrapper = mount(DeviceProbe);
    setViewportWidth(390);
    window.dispatchEvent(new Event('orientationchange'));
    await flushDeviceUpdate();

    expect(wrapper.text()).toBe('mobile:true');
    wrapper.unmount();
  });
});
