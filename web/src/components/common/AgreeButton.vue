<template>
  <v-checkbox
    v-model="state"
    :label="text"
    :color="themeColor"
    density="compact"
    hide-details
    class="agree-control text-small"
  />
</template>
<script>
import { globalProperties } from '@/main';

export default {
  name: 'AgreeButton',
  props: {
    text: {
      type: String,
      default: '自动登陆'
    }
  },
  setup(){
    const themeColor=globalProperties.$themeColor;
    return {
        themeColor
    }
  },
  data(){
    return {
        state: false
    }
  },
  watch:{
    state(val){
        this.$emit('agree', Boolean(val));
    }
  },
  methods:{
  }
}
</script>
<style scoped>
.agree-control {
  flex: 0 0 auto;
  margin: 0;
}

.agree-control :deep(.v-selection-control) {
  min-height: 32px;
}

.agree-control :deep(.v-label) {
  font-size: 14px;
  line-height: 20px;
  opacity: 1;
}
</style>
