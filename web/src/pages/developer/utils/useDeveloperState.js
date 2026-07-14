/**
 * DeveloperPage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';
import { useDevice } from '@/app/composables/useDevice';

export function useDeveloperState() {
  const { ifMobile } = useDevice();
  const themeColor = computed(() => globalProperties.$themeColor || '#667eea');
  const currentDoc = ref('');
  const expandedKeys = ref(new Set());
  const loadState = ref(false);
  const mobileDrawerOpen = ref(false);
  
  return {
    ifMobile,
    themeColor,
    currentDoc,
    expandedKeys,
    loadState,
    mobileDrawerOpen,
  };
}
