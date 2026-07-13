/**
 * Route components must be plain lazy import functions. Vue Router owns the
 * loading lifecycle and can reuse the resolved component without an extra
 * defineAsyncComponent wrapper.
 */
export const WelcomePage = () => import('@/pages/welcome/index.vue');
export const SearchPage = () => import('@/pages/search/index.vue');
export const CoursePage = () => import('@/pages/course/index.vue');
export const ArticlePage = () => import('@/pages/article/index.vue');
export const PostPage = () => import('@/pages/post/index.vue');
export const IndexPage = () => import('@/pages/index/index.vue');
export const LoginPage = () => import('@/pages/login/index.vue');
export const ChatPage = () => import('@/pages/chat/index.vue');
export const SelfPage = () => import('@/pages/self/index.vue');
export const EditorPage = () => import('@/pages/editor/index.vue');
export const ManagePage = () => import('@/pages/manage/index.vue');
export const AuthorPage = () => import('@/pages/author/index.vue');
export const DocumentPage = () => import('@/pages/DocumentPage.vue');
export const ErrorPage = () => import('@/pages/ErrorPage.vue');
export const BannedPage = () => import('@/pages/BannedPage.vue');
export const ServicePage = () => import('@/pages/ServicePage.vue');
export const DevPage = () => import('@/pages/DevPage.vue');
export const TestPage = () => import('@/pages/TestPage.vue');
export const SearchMobilePage = () => import('@/pages/search/SearchMobilePage.vue');
export const RagChatPage = () => import('@/pages/RagChatPage.vue');
export const AgentPage = () => import('@/pages/agent/index.vue');
export const SectionEditorPage = () => import('@/pages/section_editor/index.vue');
export const SectionPage = () => import('@/pages/section/index.vue');
export const SectionSetPage = () => import('@/pages/section_set/index.vue');
export const DeveloperPage = () => import('@/pages/developer/index.vue');
