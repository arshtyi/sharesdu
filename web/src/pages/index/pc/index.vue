<template>
  <v-dialog v-model="ifShowDialog" class="full-screen dialog">
    <div class="dialog-card-container">
    </div>
  </v-dialog>
  <div class="full-screen">
    <div class="desktop-index-wrap">
      <v-pull-to-refresh 
        id="item-container" 
        :pull-down-threshold="64" 
        @load="handleRefresh" 
      >
        <div class="desktop-index-shell">
          <main class="desktop-main-column">
            <transition name="tab-fade" mode="out-in">
              <ArticleList
                v-if="itemType === 'article'"
                :key="'article'"
                :article-list="articleList[articleSortMethod]"
                :sort-method="articleSortMethod"
                :theme-color="themeColor"
                :if-mobile="ifMobile"
                :all-load="allLoad.article[articleSortMethod]"
                :loading="loading.article"
                @update:sort-method="articleSortMethod = $event"
                @load-more="handleLoadMore('article')"
              />
              <PostList
                v-else-if="itemType === 'post'"
                :key="'post'"
                :post-list="postList"
                :theme-color="themeColor"
                :all-load="allLoad.post"
                :loading="loading.post"
                @load-more="handleLoadMore('post')"
              />
              <CourseList
                v-else-if="itemType === 'course'"
                :key="'course'"
                :course-list="courseList"
                :theme-color="themeColor"
                :all-load="allLoad.course"
                :loading="loading.course"
                @load-more="handleLoadMore('course')"
              />
              <SectionList
                v-else-if="itemType === 'section'"
                :key="'section'"
                :section-list="sectionList"
                :theme-color="themeColor"
                :loading="loading.section"
              />
              <ServiceList v-else-if="itemType === 'service'" :key="'service'" />
            </transition>
          </main>
          <DesktopDiscoverySidebar
            :section-list="sectionList"
            :current-type="itemType"
            @select-type="itemType = $event"
          />
        </div>
      </v-pull-to-refresh>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted, nextTick, computed, inject, onBeforeMount } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { VPullToRefresh } from 'vuetify/lib/labs/components.mjs';
import { isElementAtBottom } from '@/utils/other';
import {
  ArticleList,
  PostList,
  CourseList,
  SectionList,
  ServiceList,
  DesktopDiscoverySidebar,
} from './components';
import { useIndexState, useIndexData, useIndexLoad, useIndexRestore } from '../utils';
//itemtab由AppDesktop提供
// 定义组件名称
defineOptions({
  name: 'IndexPagePc'
});

// 使用 Composables
const {
  itemType: localItemType,
  articleSortMethod,
  selectedSectionId,
  ifMounted,
  lastPageNum,
  ifMobile,
  themeColor,
} = useIndexState();

// 从 AppDesktop 注入的 itemType（用于导航栏同步）
const indexItemType = inject('indexItemType', null);

// 使用注入的 itemType 或本地 itemType
const itemType = indexItemType || localItemType;

// 同步 itemType：当导航栏的 itemType 变化时，更新本地状态
if (indexItemType) {
  watch(indexItemType, (newVal) => {
    if (localItemType.value !== newVal) {
      localItemType.value = newVal;
    }
  });
  
  // 同步本地 itemType 到导航栏
  watch(localItemType, (newVal) => {
    if (indexItemType.value !== newVal) {
      indexItemType.value = newVal;
    }
  });
}

// 页面恢复机制
const {
  isRestoring,
  restoreComplete,
  restoreState,
  saveState,
  getTargetPageNum,
  shouldRestore,
} = useIndexRestore();

const {
  articleList,
  postList,
  courseList,
  sectionList,
  articlePageNum,
  postPageNum,
  coursePageNum,
  sectionPageNum,
  loading,
  allLoad,
  setArticles,
  addArticles,
  setPosts,
  addPosts,
  setCourses,
  addCourses,
  setSections,
  addSections,
  addPost,
} = useIndexData();

// 定义 emit
const emit = defineEmits(['alert', 'set_loading']);

// 对话框状态
const ifShowDialog = computed(() => false);

// 加载逻辑
const { refresh, loadMore, restoreScrollAndLoad, canLoadMore } = useIndexLoad(
  itemType,
  articleSortMethod,
  selectedSectionId,
  articleList,
  postList,
  courseList,
  sectionList,
  articlePageNum,
  postPageNum,
  coursePageNum,
  sectionPageNum,
  loading,
  allLoad,
  setArticles,
  addArticles,
  setPosts,
  addPosts,
  setCourses,
  addCourses,
  setSections,
  addSections,
  (msg) => emit('alert', msg)
);

// 处理刷新
const handleRefresh = async ({ done }) => {
  if (itemType.value !== 'service') {
    await refresh(itemType.value);
  }
  done('ok');
};

// 处理加载更多
const handleLoadMore = async (type) => {
  await loadMore(type);
};

// 监听 itemType 变化
watch(itemType, (newVal) => {
  if (!ifMounted.value) {
    return;
  }
  
  switch (newVal) {
    case 'article':
      if (articleList.value[articleSortMethod.value].length === 0) {
        handleLoadMore('article');
      }
      break;
    case 'post':
      if (postList.value.length === 0) {
        handleLoadMore('post');
      }
      // 同时加载板块列表
      if (sectionList.value.length === 0) {
        handleLoadMore('section');
      }
      break;
    case 'course':
      if (courseList.value.length === 0) {
        handleLoadMore('course');
      }
      break;
    case 'section':
      if (sectionList.value.length === 0) {
        handleLoadMore('section');
      }
      break;
    case 'service':
      break;
  }
}, { immediate: true });

// 监听 articleSortMethod 变化
watch(articleSortMethod, (newVal, oldVal) => {
  if (newVal === oldVal) {
    return;
  }
  if (itemType.value === 'article' && articleList.value[articleSortMethod.value].length === 0) {
    handleLoadMore('article');
  }
});

// 滚动加载
const glideLoad = () => {
  if (!['article', 'post', 'course'].includes(itemType.value)) {
    return;
  }
  // 防止在其他加载未完成时加载
  if (!canLoadMore()) {
    return;
  }
  const container = document.getElementById('item-container');
  if (container && isElementAtBottom(container)) {
    handleLoadMore(itemType.value);
  }
};

// 路由离开前保存状态
onBeforeRouteLeave((to, from, next) => {
  try {
    const scrollPosition = document.getElementById('router-view-container').scrollTop; 
    saveState({
      itemType: itemType.value,
      pageNum: {
        article: articlePageNum.value,
        post: postPageNum.value,
        course: coursePageNum.value,
      },
      scrollPosition: scrollPosition,
      articleSortMethod: articleSortMethod.value,
    });
  } catch (e) {
    console.error('Failed to save state:', e);
  }
  next();
});
onBeforeMount(async () => {
  const restoredState = restoreState();
  if (shouldRestore(restoredState)) {
    console.log('恢复状态');
    // 需要恢复状态
    isRestoring.value = true;
    console.log("restoredState",restoredState);
    // 恢复基本状态
    itemType.value = restoredState.itemType;
    articleSortMethod.value = restoredState.articleSortMethod;
    selectedSectionId.value = restoredState.selectedSectionId || 20;
    lastPageNum.value = restoredState.pageNum;
    
    // 如果是帖子页面，先加载板块列表
    if (itemType.value === 'post' && sectionList.value.length === 0) {
      await handleLoadMore('section');
    }
    
    // 静态微服务目录无需调用分页 API
    if (itemType.value !== 'service') {
      await handleLoadMore(itemType.value);
    }
    // 恢复滚动位置并加载到目标页码
    const targetPageNum = getTargetPageNum(
      itemType.value,
      restoredState.pageNum,
      {
        article: articlePageNum.value,
        post: postPageNum.value,
        course: coursePageNum.value,
      },
      articleSortMethod.value
    );
    console.log("targetPageNum",targetPageNum);
    // 如果目标页码大于1，需要加载更多
    if (targetPageNum > 1) {
      await restoreScrollAndLoad(
        itemType.value,
        restoredState.pageNum,
      );
    }
  }
});
let rafId = null;
// 优化的滚动监听
const handleScroll = () => {
  // 取消之前的 RAF
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  // 在下一帧执行检测
  rafId = requestAnimationFrame(glideLoad);
};
// 挂载时恢复状态（优化版）
onMounted(async () => {
  const restoredState = restoreState();
  
  // 设置页面标题
  const webTitle = document.getElementById('web-title');
  if (webTitle) {
    webTitle.innerText = 'ShareSDU | 首页';
  }
  if(shouldRestore(restoredState)) {
    await nextTick();
    // 使用 requestAnimationFrame 确保 DOM 完全渲染
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const scrollElement = document.getElementById('router-view-container');
        if (scrollElement) {
          scrollElement.scrollTop = restoredState.scrollPosition || 0;
        }
      });
    });
  }else{
    // 不需要恢复，正常加载
    // 如果是帖子页面，先加载板块列表
    if (itemType.value === 'post' && sectionList.value.length === 0) {
      await handleLoadMore('section');
    }
    if (itemType.value !== 'service') {
      await handleLoadMore(itemType.value);
    }
    restoreComplete.value = true;
  }

  // 发现侧栏在首次进入和状态恢复时都需要板块数据。
  if (sectionList.value.length === 0) {
    await handleLoadMore('section');
  }

  ifMounted.value = true;
  // 添加滚动监听
  const routerViewContainer = document.getElementById('router-view-container');
  if (routerViewContainer) {
    routerViewContainer.addEventListener('scroll', handleScroll);
  }
});

// 卸载时清理
onUnmounted(() => {
  const routerViewContainer = document.getElementById('router-view-container');
  if (routerViewContainer) {
    routerViewContainer.removeEventListener('scroll', handleScroll);
  }
});

// 暴露方法供外部调用
defineExpose({
  addPost,
});
</script>

<style scoped>
/** desktop */
@media screen and (min-width: 1000px) {
  .full-screen {
    width: 100%;
    min-height: 100%;
    background: #fff;
  }

  .dialog-card-container {
    display: flex;
    justify-content: center;
  }

  .desktop-index-wrap {
    width: 100%;
    padding: 10px 24px 56px;
    box-sizing: border-box;
  }

  .desktop-index-wrap :deep(.v-pull-to-refresh) {
    width: 100%;
  }

  .desktop-index-shell {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    max-width: 1090px;
    margin: 0 auto;
    gap: 24px;
  }

  .desktop-main-column {
    width: 750px;
    min-width: 0;
    flex-shrink: 0;
  }

  @media screen and (max-width: 1199px) {
    .desktop-index-shell {
      max-width: 750px;
    }

    .desktop-index-shell :deep(.discovery-sidebar) {
      display: none;
    }
  }
}

/* 选项卡切换过渡动画 */
.tab-fade-enter-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}

.tab-fade-leave-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.tab-fade-enter-to,
.tab-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
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

  .desktop-index-wrap {
    display: flex;
    width: 100vw;
    justify-content: center;
  }

  .desktop-index-shell :deep(.discovery-sidebar) {
    display: none;
  }
}
</style>
