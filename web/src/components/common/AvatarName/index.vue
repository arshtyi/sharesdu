<!-- 头像名称组件主入口 - 根据设备类型动态加载 PC 端或移动端组件 -->
<template>
  <span class="avatar-name-root">
    <component :is="deviceType === 'desktop' ? AvatarNamePc : AvatarNameMobile"
        :init-data="initData" 
        :size="size" 
        :color="color" 
        :clickable="clickable" 
        :if-show-name="ifShowName" 
        :name-size="nameSize" 
        :lazy="lazy"
    />
  </span>
</template>
<script>
import { useDevice } from '@/app/composables/useDevice';
import AvatarNamePc from './pc.vue';
import AvatarNameMobile from './mobile.vue';

export default {
    name: 'AvatarName',
    props: {
        initData: {
            type: Object,
            default: function () {
                return {
                    id: null,
                    name: null,
                }
            }
        },
        size: {
            type: String,
            default: '30'
        },
        color: {
            type: String,
            default: '#000'
        },
        clickable: {
            type: Boolean,
            default: true
        },
        ifShowName: {
            type: Boolean,
            default: true
        },
        nameSize: {
            type: String,
            default: '16'
        },
        lazy: {
            type: Boolean,
            default: true
        }
    },
    setup() {
        const { deviceType } = useDevice();
        return {
            deviceType,
            AvatarNamePc,
            AvatarNameMobile,
        }
    },
    components: {
        AvatarNamePc,
        AvatarNameMobile,
    },
}
</script>
<style scoped>
.avatar-name-root {
  display: inline-flex;
  min-width: 0;
}
</style>
