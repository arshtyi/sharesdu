/**
 * SectionSetPage 状态管理 Composable
 */
import { ref } from 'vue';
import { globalProperties } from '@/main';
import { useDevice } from '@/app/composables/useDevice';

export function useSectionSetState() {
  // 是否已挂载
  const ifMounted = ref(false);
  
  // 是否为移动端
  const { deviceType, ifMobile } = useDevice();
  
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  return {
    ifMounted,
    ifMobile,
    themeColor,
    deviceType,
  };
}
