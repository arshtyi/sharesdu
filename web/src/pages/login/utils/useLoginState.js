/**
 * LoginPage 状态管理 Composable
 */
import { ref, computed } from 'vue';
import { globalProperties } from '@/main';
import { useDevice } from '@/app/composables/useDevice';

export function useLoginState() {
  // 主题颜色
  const themeColor = globalProperties.$themeColor;
  
  // 设备类型
  const { deviceType, ifMobile } = useDevice();
  const inputType = computed(() => deviceType.value === 'desktop' ? 'compact' : 'comfortable');
  
  // UI 状态
  const ifShowEmailExamineCard = ref(false);
  const ifShowDialog = computed(() => {
    return ifShowEmailExamineCard.value;
  });
  
  // 标签页状态
  const nowTab = ref('login');
  
  // 登录方法
  const loginMethod = ref('userName'); // userName/email
  
  // 注册方法
  const registerMethod = ref('email'); // email/invite
  
  // 注册步骤
  const registerByEmailStep = ref(0);
  const registerByInviteStep = ref(0);
  
  // 密码可见性
  const passwdVisible = ref(false);
  
  // 是否保存密码
  const ifSavePasswd = ref(false);
  
  // 轮播图模型
  const carouselModel = ref(0);
  
  /**
   * 设置邮箱验证卡片状态
   * @param {Boolean} state - 是否显示
   */
  const setEmailExamineCardState = (state) => {
    ifShowEmailExamineCard.value = state;
  };
  
  /**
   * 切换登录方法
   */
  const shiftLoginMethod = () => {
    loginMethod.value = loginMethod.value === 'userName' ? 'email' : 'userName';
  };
  
  /**
   * 切换注册方法
   */
  const shiftRegisterMethod = () => {
    registerMethod.value = registerMethod.value === 'email' ? 'invite' : 'email';
  };
  
  return {
    themeColor,
    deviceType,
    inputType,
    ifMobile,
    ifShowEmailExamineCard,
    ifShowDialog,
    nowTab,
    loginMethod,
    registerMethod,
    registerByEmailStep,
    registerByInviteStep,
    passwdVisible,
    ifSavePasswd,
    carouselModel,
    setEmailExamineCardState,
    shiftLoginMethod,
    shiftRegisterMethod,
  };
}
