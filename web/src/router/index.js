import { getCookie } from '@/utils/cookie';
import { selfDefineLocalStorage } from '@/utils/localStorage';
import { selfDefinedSessionStorage } from '@/utils/sessionStorage';
import { createRouter, createWebHashHistory } from 'vue-router';
import { schedulePruneStaleCaches } from '@/utils/cacheManager';
import {
  WelcomePage,
  SearchPage,
  CoursePage,
  ArticlePage,
  PostPage,
  IndexPage,
  LoginPage,
  ChatPage,
  SelfPage,
  EditorPage,
  ManagePage,
  AuthorPage,
  DocumentPage,
  ErrorPage,
  BannedPage,
  ServicePage,
  DevPage,
  TestPage,
  SearchMobilePage,
  RagChatPage,
  AgentPage,
  SectionEditorPage,
  SectionPage,
  SectionSetPage,
  DeveloperPage
} from './asyncComponents';

// 原始路由配置
const originalRoutes = [
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/welcome',
    name: 'WelcomePage',
    component: WelcomePage,
  },
  {
    path: '/index',
    name: 'IndexPage',
    component: IndexPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/article/:id/:post?',
    name: 'ArticlePage',
    component: ArticlePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/post/:id/:reply?',
    name: 'PostPage',
    component: PostPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/section/:id',
    name: 'SectionPage',
    component: SectionPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/section_set',
    name: 'SectionSetPage',
    component: SectionSetPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/manage',
    name: 'ManagePage',
    component: ManagePage,
    meta: { requiresAuth: true },
    props: route => ({
      init_id: route.query.init_id || null,
      init_type: route.query.init_type || null,
    }),
  },
  {
    path: '/course/:id/:post?',
    name: 'CoursePage',
    component: CoursePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage,
    meta: { requiresAuth: false },
    props: route => ({
      name: route.query.userName || null,
      passwd: route.query.passwd || null,
    }),
  },
  {
    path: '/error/:reason?',
    name: 'ErrorPage',
    component: ErrorPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/banned',
    name: 'BannedPage',
    component: BannedPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/editor/:id?',
    name: 'EditorPage',
    component: EditorPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/self',
    name: 'SelfPage',
    component: SelfPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/author/:id',
    name: 'AuthorPage',
    component: AuthorPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/document/:name',
    name: 'DocumentPage',
    component: DocumentPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/chat/:id?/:name?',
    name: 'ChatPage',
    component: ChatPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    name: 'SearchPage',
    component: SearchPage,
    meta: { requiresAuth: true },
    props: route => ({
      type: route.query.type || 'all',
      sort: route.query.sort || null,
      query: route.query.query ? route.query.query.split(',') : [],
    }),
  },
  {
    path:'/search_mobile',
    name:'SearchMobilePage',
    component: SearchMobilePage,
    meta:{requiresAuth:true}
  },
  {
    path: '/service',
    name: 'ServicePage',
    component: ServicePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/rag_chat',
    name: 'RagChatPage',
    component: RagChatPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/agent',
    name: 'AgentPage',
    component: AgentPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/section_editor/:id?',
    name: 'SectionEditorPage',
    component: SectionEditorPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/developer',
    name: 'DeveloperPage',
    component: DeveloperPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/error/找不到此资源',
    meta: { requiresAuth: false },
  },
];

const developmentOnlyRoutes = process.env.NODE_ENV === 'development' ? [
  {
    path: '/test',
    name: 'TestPage',
    component: TestPage,
    meta: { requiresAuth: false },
  },
  {
    path: '/dev',
    name: 'DevPage',
    component: DevPage,
    meta: { requiresAuth: false },
  },
] : [];

const devRoutes = process.env.NODE_ENV === 'development' ? originalRoutes.map(route => ({
  ...route,
  path: '/debug' + route.path,
  name: `${route.name}Debug`,
})) : [];

const routes = [...developmentOnlyRoutes, ...originalRoutes, ...devRoutes];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL || '/'),
  routes,
});

const hasAuthenticatedSession = () => Boolean(
  getCookie('accessToken') ||
  getCookie('refreshToken') ||
  selfDefineLocalStorage.getItem('passwd')
);

// beforeEach 中逻辑不变
router.beforeEach(async (to, from, next) => {
  const toName = String(to.name || '');
  const fromName = String(from.name || '');
  if(toName.endsWith("Debug")&&!fromName.endsWith("Debug")){
    const { startDebug } = await import(/* webpackChunkName: "debug-tools" */ '@/utils/debug');
    startDebug();
    window.alert("本页面处于调试模式");
  }
  try {
    if (!["ErrorPage", "ErrorPageDebug", "BannedPage", "BannedPageDebug"].includes(to.name)) {
      let tmpTo = {
        name: to.name,
        params: to.params,
        query: to.query,
      };
      let tmpFrom = {
        name: from.name,
        params: from.params,
        query: from.query,
      };
      selfDefinedSessionStorage.setItem("lastTwoRouter", JSON.stringify({ to: tmpTo, from: tmpFrom }));
    }
  } catch (e) {
    console.error(e);
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (hasAuthenticatedSession()) {
      next();
    } else {
      selfDefineLocalStorage.setItem('lastHref', window.location.href);
      next({
        name: toName.endsWith('Debug') ? 'LoginPageDebug' : 'LoginPage',
        query: { redirect: to.fullPath },
      });
    }
  } else if (to.path === "/login"||to.path ==="/debug/login") {
    if (getCookie("refreshToken") || selfDefineLocalStorage.getItem('passwd')) {
      window.alert("您已经登录");
      if(to.path==="/login"){
        router.push({ name: "IndexPage" });
      }else if(to.path==="/debug/login"){
        router.push({ name: "IndexPageDebug" });
      }
      return;
    } else {
      next();
    }
  } else {
    next();
  }
});

// 路由切换后，立即重置滚动位置
// 如果页面有保存的状态，会在 onMounted 中恢复滚动位置
router.afterEach(() => {
  const scrollElement = document.getElementById('router-view-container');
  if (scrollElement) {
    // 立即重置为0，避免显示上一个页面的滚动位置
    scrollElement.scrollTop = 0;
  }
  schedulePruneStaleCaches();
});

export default router;
