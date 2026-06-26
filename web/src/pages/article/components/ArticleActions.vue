<template>
  <div class="bottom-bar">
    <div class="column-center user-name text-medium">{{ userName }}</div>
    <v-spacer class="spacer"></v-spacer>
    <div class="row-reverse">
      <!-- 管理员按钮 -->
      <div v-if="ifMaster && !ifMobile" class="column-center padding-right-5px">
        <manage-button :id="article.id" :type="'article'" size="23" />
      </div>
      
      <!-- 举报按钮 -->
      <div v-if="userId != article.authorId && !ifMobile" class="column-center padding-right-5px">
        <alert-button :id="article.id" :type="'article'" />
      </div>
      
      <!-- 编辑和删除按钮（作者） -->
      <div v-else-if="!ifMobile" class="row-div">
        <div class="column-center padding-right-5px">
          <v-btn elevation="0" @click="$emit('edit')" icon class="bottom-btn">
            <v-icon icon="mdi-pencil-outline" size="23"></v-icon>
          </v-btn>
        </div>
        <div class="column-center padding-right-5px">
          <delete-button
            @delete="$emit('delete')"
            :id="article.id"
            :type="'article'"
            :size="24"
            @alert="$emit('alert', $event)"
            @set_loading="$emit('set-loading', $event)"
          />
        </div>
      </div>
      
      <!-- 评论按钮 -->
      <div class="column-center padding-right-10px">
        <v-btn elevation="0" @click="$emit('comment')" icon class="bottom-btn">
          <v-icon icon="mdi-comment-outline" size="23"></v-icon>
          <v-tooltip activator="parent">查看帖子</v-tooltip>
        </v-btn>
      </div>
      
      <!-- 收藏按钮 -->
      <div class="column-center padding-right-10px">
        <star-button
          v-if="article.id"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
          :type="'article'"
          :id="article.id"
          :state="article.ifStar"
        />
      </div>
      
      <!-- 点赞按钮 -->
      <div class="column-center padding-right-5px">
        <like-button
          v-if="article.id"
          @alert="$emit('alert', $event)"
          @set_loading="$emit('set-loading', $event)"
          :id="article.id"
          :type="'article'"
          :state="article.ifLike"
        />
      </div>

      <!-- Markdown 复制 / 下载 -->
      <template v-if="editorType === 'md'">
        <div class="column-center padding-right-10px">
          <v-btn
            elevation="0"
            icon
            class="bottom-btn"
            :disabled="!article.content"
            @click="handleCopyMarkdown"
          >
            <v-icon icon="mdi-content-copy" size="23"></v-icon>
            <v-tooltip activator="parent">复制 Markdown</v-tooltip>
          </v-btn>
        </div>
        <div class="column-center padding-right-10px">
          <v-btn
            elevation="0"
            icon
            class="bottom-btn"
            :disabled="!article.content"
            @click="handleDownloadMarkdown"
          >
            <v-icon icon="mdi-download" size="23"></v-icon>
            <v-tooltip activator="parent">下载 Markdown</v-tooltip>
          </v-btn>
        </div>
      </template>
    </div>
  </div>

  <v-dialog v-model="ifShowMobileDownloadDialog" style="width: 100%; height: 100%; justify-content: center;">
    <div v-if="ifShowMobileDownloadDialog" style="width: 100%; height: 100%; justify-content: center; display: flex;">
      <v-card class="download-dialog-card">
        <span class="title-bold">提示</span>
        <span class="text-small">在 App 中下载若无法生效，可先复制 Markdown，或在浏览器中打开本页后下载。</span>
        <div class="download-dialog-actions">
          <v-spacer />
          <v-btn density="compact" variant="outlined" @click="ifShowMobileDownloadDialog = false">取消</v-btn>
          <v-btn
            density="compact"
            variant="outlined"
            color="primary"
            style="margin-left: 10px;"
            @click="confirmMobileDownload"
          >继续下载</v-btn>
        </div>
      </v-card>
    </div>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import ManageButton from '@/components/manage/ManageButton.vue';
import AlertButton from '@/components/report/AlertButton.vue';
import DeleteButton from '@/components/common/DeleteButton.vue';
import StarButton from '@/components/star/StarButton.vue';
import LikeButton from '@/components/common/LikeButton.vue';
import { getDeviceType } from '@/utils/device';
import { copyMarkdownContent, downloadMarkdownContent } from '@/utils/markdownExport';

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  ifMaster: {
    type: Boolean,
    default: false,
  },
  editorType: {
    type: String,
    default: 'html',
  },
});

const emit = defineEmits(['edit', 'delete', 'comment', 'alert', 'set-loading']);

const ifMobile = getDeviceType() === 'mobile';
const ifShowMobileDownloadDialog = ref(false);

function handleCopyMarkdown() {
  copyMarkdownContent(props.article.content, (msg) => emit('alert', msg));
}

function handleDownloadMarkdown() {
  if (ifMobile) {
    ifShowMobileDownloadDialog.value = true;
    return;
  }
  downloadMarkdownContent(props.article.content, props.article.title, (msg) => emit('alert', msg));
}

function confirmMobileDownload() {
  ifShowMobileDownloadDialog.value = false;
  downloadMarkdownContent(props.article.content, props.article.title, (msg) => emit('alert', msg));
}
</script>

<style scoped>
.column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.padding-right-5px {
  padding-right: 5px;
}

.padding-right-10px {
  padding-right: 10px;
}

.row-div {
  overflow-x: auto;
  max-width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
}

.bottom-btn {
  width: 23px;
  height: 23px;
  color: #8a8a8a;
  background-color: rgba(0, 0, 0, 0);
}

.download-dialog-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  max-width: 90vw;
}

.download-dialog-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
}

@media screen and (min-width: 1000px) {
  .bottom-bar {
    display: flex;
    width: 1000px;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    height: 40px;
    z-index: 99;
    border: #8a8a8a 1px solid;
    background-color: #ffffff;
  }

  .user-name {
    margin-left: 10px;
    max-width: 300px;
    color: var(--theme-color);
  }

  .row-reverse {
    display: flex;
    flex-direction: row-reverse;
  }
}

@media screen and (max-width: 1000px) {
  .bottom-bar {
    display: flex;
    width: 100vw;
    flex-direction: row;
    position: fixed;
    bottom: 0;
    height: 40px;
    z-index: 99;
    border: #8a8a8a 1px solid;
    background-color: #ffffff;
  }

  .user-name {
    margin-left: 2vw;
    width: 30vw;
    color: var(--theme-color);
  }

  .spacer {
    max-width: 30vw;
    font-size: 0px;
  }

  .row-reverse {
    display: flex;
    flex-direction: row-reverse;
    width: 55vw;
  }
}
</style>
