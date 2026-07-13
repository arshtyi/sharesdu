<template>
  <IndexPagePc v-if="deviceType === 'desktop'" />
  <IndexPageMobile v-else />
</template>

<script setup>
import { useDevice } from '@/app/composables';
import IndexPagePc from './pc/index.vue';
import IndexPageMobile from './mobile/index.vue';
const { deviceType } = useDevice();
defineOptions({
  name: 'IndexPage'
});
defineEmits(['search_type_changed']);
</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
  .full-screen {
    width: 100%;
    height: 100%;
  }

  .dialog-card-container {
    display: flex;
    justify-content: center;
  }

  .row-center {
    display: flex;
    flex-direction: row;
    width: 100vw;
    justify-content: center;
  }
}

/** mobile */
@media screen and (max-width: 1000px) {
  .full-screen {
    width: 100vw;
    height: 100vh;
  }

  .dialog-card-container {
    display: flex;
    justify-content: center;
  }

  .row-center {
    display: flex;
    flex-direction: row;
    width: 100vw;
    justify-content: center;
  }
}
</style>
