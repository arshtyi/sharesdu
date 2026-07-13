/**
 * 设备类型管理 Composable
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const DEVICE_BREAKPOINT = 1000;

const readDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth <= DEVICE_BREAKPOINT ? 'mobile' : 'desktop';
};

export function useDevice() {
  const deviceType = ref(readDeviceType());
  let frame = null;

  const updateDeviceType = () => {
    if (frame != null) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = null;
      deviceType.value = readDeviceType();
    });
  };

  onMounted(() => {
    window.addEventListener('resize', updateDeviceType, { passive: true });
    window.addEventListener('orientationchange', updateDeviceType, { passive: true });
    updateDeviceType();
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDeviceType);
    window.removeEventListener('orientationchange', updateDeviceType);
    if (frame != null) cancelAnimationFrame(frame);
  });
  
  const ifMobile = computed(() => {
    return deviceType.value === 'mobile';
  });
  
  return {
    deviceType,
    ifMobile,
  };
}
