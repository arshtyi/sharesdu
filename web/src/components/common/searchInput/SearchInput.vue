<template>
  <div id="search-input" class="input-container" :style="containerStyle">
    <input
      v-model="inputValue"
      type="text"
      class="input-box"
      :style="inputBoxStyle"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
      @keydown.enter.prevent="submitSearch"
      :placeholder="placeholderText"
    />
    <div
      v-show="shouldShowSuggestions"
      class="suggestion-container"
      @mousedown.prevent
    >
      <recommend-card @fill-search-input="fillSearchInput" v-show="showHot"></recommend-card>
      <div style="height: 80%; background-color: grey; width: 10px;"></div>
      <history-card @fill-search-input="fillSearchInput" v-show="showHistory"></history-card>
    </div>
  </div>
</template>
<script>
import HistoryCard from './utils/HistoryCard.vue';
import RecommendCard from './utils/RecommendCard.vue';

export default {
  emits: ['update:modelValue', 'blur', 'submit'],
  data() {
    return {
      inputValue: this.modelValue,
      isFocused: false, // 输入框是否获得焦点
      isSuggestionOpen: false, // 是否显示搜索建议
      showHistory: true, // 是否显示历史记录
      showHot: true, // 是否显示热榜
    };
  },
  props: {
    canSuggestion:{
      type:Boolean,
      default:true
    },
    modelValue: { // 接收父组件传递的值
      type: String,
      default: ''
    },
    containerStyle: {
      type: Object,
      default: () => ({})
    },
    inputStyle: {
      type: Object,
      default: () => ({})
    },
    borderColor: { // 传入的边框颜色
      type: String,
      default: 'white',
    },
    boxShadowColor: { // 传入的阴影颜色
      type: String,
      default: 'rgba(255, 255, 255, 0.5)',
    },
    placeholderColor: { // 传入的 placeholder 字体颜色
      type: String,
      default: '#aaa',
    },
    placeholderText: { // 传入的 placeholder 文本
      type: String,
      default: '请输入...'
    }
  },
  watch: {
    modelValue(newValue) {
      this.inputValue = newValue;
    },
    inputValue(newValue) {
      this.$emit('update:modelValue', newValue);
    }
  },
  components: {
    HistoryCard,
    RecommendCard,
  },
  computed: {
    shouldShowSuggestions() {
      return this.canSuggestion && this.isFocused && this.isSuggestionOpen;
    },
    // 动态生成 input 框的样式
    inputBoxStyle() {
      return Object.assign({},{
        borderColor: this.isFocused ? this.borderColor : '#aaa',
        boxShadow: this.isFocused ? `0 0 5px ${this.boxShadowColor}` : 'none',
      },this.inputStyle);
    },
  },
  methods: {
    onFocus() {
      this.isFocused = true;
      this.isSuggestionOpen = true;
    },
    onBlur() {
      //提交事件：搜索输入框失去焦点
      this.$emit('blur');
      this.isFocused = false;
      this.isSuggestionOpen = false;
    },
    onInput() {
      if (this.isFocused) {
        this.isSuggestionOpen = true;
      }
    },
    submitSearch(event) {
      event.currentTarget.blur();
      this.isFocused = false;
      this.isSuggestionOpen = false;
      this.$emit('submit');
    },
    fillSearchInput(text){
      this.inputValue=text;
    }
  }
};
</script>
<style scoped>
.input-container {
  position: relative;
  display: inline-block;
  z-index: 1000;
}

.input-box {
  padding: 3px;
  border: 1px solid #aaa;
  border-radius: 5px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.input-box:focus {
  /* 这里不再直接设置颜色，而是通过 :style 动态绑定 */
}

.input-box::placeholder {
  color: var(--placeholder-color, #aaa); /* 通过动态 CSS 属性设置 placeholder 的颜色 */
}

@media screen and (max-width: 1000px) {
  .suggestion-container {
    position: absolute;
    width: fit-content;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 3px;
    transition: max-height 0.3s ease;
  }
}

@media screen and (min-width: 1000px) {
  .suggestion-container {
    position: absolute;
    width: fit-content;
    display: flex;
    flex-direction: row;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top: 3px;
    transition: max-height 0.3s ease;
  }
}
</style>
