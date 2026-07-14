<template>
  <aside class="discovery-sidebar" aria-label="发现更多内容">
    <section v-if="currentType !== 'section'" class="discovery-card" aria-labelledby="hot-section-title">
      <div class="discovery-card__header">
        <h2 id="hot-section-title">热门板块</h2>
        <button type="button" @click="viewAllSections">查看全部</button>
      </div>
      <div v-if="sectionList.length" class="compact-list">
        <a
          v-for="section in sectionList.slice(0, 5)"
          :key="section.id"
          class="compact-item"
          :href="`#/section/${section.id}`"
        >
          <span class="compact-item__icon" aria-hidden="true">
            <v-icon icon="mdi-bulletin-board-outline" size="18" />
          </span>
          <span class="compact-item__body">
            <strong>{{ section.sectionName || '未命名板块' }}</strong>
            <small>{{ section.summary || '查看板块最新讨论' }}</small>
          </span>
          <v-icon icon="mdi-chevron-right" size="18" aria-hidden="true" />
        </a>
      </div>
      <div v-else class="discovery-card__loading">板块加载中…</div>
    </section>

    <section v-if="currentType !== 'service'" class="discovery-card" aria-labelledby="service-shortcut-title">
      <div class="discovery-card__header">
        <h2 id="service-shortcut-title">常用微服务</h2>
        <button type="button" @click="$emit('select-type', 'service')">全部服务</button>
      </div>
      <div class="compact-list">
        <a
          v-for="service in services.slice(0, 5)"
          :key="service.link"
          class="compact-item"
          :href="service.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="compact-item__icon compact-item__icon--service" aria-hidden="true">
            <v-icon :icon="service.icon || 'mdi-puzzle-outline'" size="19" />
          </span>
          <span class="compact-item__body">
            <strong>{{ service.title }}</strong>
            <small>{{ service.category }}</small>
          </span>
          <v-icon icon="mdi-open-in-new" size="15" aria-hidden="true" />
        </a>
      </div>
    </section>
  </aside>
</template>

<script setup>
import { services } from '@/config';
import { openPage } from '@/utils/other';

defineProps({
  sectionList: {
    type: Array,
    required: true,
  },
  currentType: {
    type: String,
    required: true,
  },
});

defineEmits(['select-type']);

const viewAllSections = () => {
  openPage('router', { name: 'SectionSetPage' });
};
</script>

<style scoped>
.discovery-sidebar {
  position: sticky;
  top: 14px;
  width: 300px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.discovery-card {
  padding: 16px;
  border: 1px solid #eceef1;
  border-radius: 12px;
  background: #fff;
}

.discovery-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.discovery-card__header h2 {
  margin: 0;
  color: #282b30;
  font-size: 16px;
}

.discovery-card__header button {
  padding: 4px;
  border: 0;
  background: transparent;
  color: var(--theme-color, #9c0c13);
  font-size: 12px;
  cursor: pointer;
}

.compact-list {
  display: flex;
  flex-direction: column;
}

.compact-item {
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 2px;
  color: #35383d;
  text-decoration: none;
  border-radius: 8px;
}

.compact-item + .compact-item {
  border-top: 1px solid #f1f2f4;
}

.compact-item:hover {
  background: #faf7f7;
}

.compact-item:focus-visible,
.discovery-card__header button:focus-visible {
  outline: 2px solid var(--theme-color, #9c0c13);
  outline-offset: 2px;
}

.compact-item__icon {
  width: 32px;
  height: 32px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #f4f4f5;
  color: #5f6368;
}

.compact-item__icon--service {
  background: #f7eff0;
  color: var(--theme-color, #9c0c13);
}

.compact-item__body {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.compact-item__body strong,
.compact-item__body small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-item__body strong {
  font-size: 13px;
  font-weight: 600;
}

.compact-item__body small,
.discovery-card__loading {
  color: #8a8f98;
  font-size: 12px;
}

.discovery-card__loading {
  padding: 16px 2px;
}
</style>
