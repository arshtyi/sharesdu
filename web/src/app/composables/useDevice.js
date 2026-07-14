/**
 * 设备类型管理 Composable
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const DEVICE_BREAKPOINT = 1000;

const readDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth <= DEVICE_BREAKPOINT ? 'mobile' : 'desktop';
};

// All consumers share one source of truth. This prevents the app shell and
// nested cards from disagreeing after a resize or an orientation change.
export const deviceTypeState = ref(readDeviceType());
let subscriberCount = 0;
let frame = null;

const updateDeviceType = () => {
  if (frame != null && typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(frame);
  }

  const commit = () => {
    frame = null;
    deviceTypeState.value = readDeviceType();
  };

  frame = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(commit)
    : setTimeout(commit, 0);
};

export function useDevice() {
  onMounted(() => {
    subscriberCount += 1;
    if (subscriberCount === 1) {
      window.addEventListener('resize', updateDeviceType, { passive: true });
      window.addEventListener('orientationchange', updateDeviceType, { passive: true });
    }
    updateDeviceType();
  });

  onBeforeUnmount(() => {
    subscriberCount = Math.max(0, subscriberCount - 1);
    if (subscriberCount === 0) {
      window.removeEventListener('resize', updateDeviceType);
      window.removeEventListener('orientationchange', updateDeviceType);
      if (frame != null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(frame);
      }
      frame = null;
    }
  });
  
  const ifMobile = computed(() => {
    return deviceTypeState.value === 'mobile';
  });
  
  return {
    deviceType: deviceTypeState,
    ifMobile,
  };
}
