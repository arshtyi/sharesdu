<template>
  <section class="service-list" aria-labelledby="service-list-title">
    <header class="service-list__header">
      <div>
        <h1 id="service-list-title">校园微服务</h1>
        <p>集中访问校内平台与学生维护的实用工具</p>
      </div>
      <span class="service-list__count">{{ services.length }} 项服务</span>
    </header>

    <div class="service-list__grid">
      <ServiceCard
        v-for="service in services"
        :key="service.link"
        :link="service.link"
        :title="service.title"
        :description="service.description"
        :category="service.category"
        :source="service.source"
        :icon="service.icon"
        :icon-size="30"
      />
    </div>
  </section>
</template>

<script setup>
import { services } from '@/config';
import ServiceCard from '@/components/service/ServiceCard.vue';
</script>

<style scoped>
.service-list {
  width: 750px;
  padding: 18px;
  border: 1px solid #eceef1;
  border-radius: 12px;
  background: #fff;
}

.service-list__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 16px;
}

.service-list__header h1 {
  margin: 0;
  color: #202124;
  font-size: 22px;
  line-height: 1.4;
}

.service-list__header p {
  margin: 5px 0 0;
  color: #72767d;
  font-size: 14px;
}

.service-list__count {
  flex: none;
  padding: 5px 10px;
  border-radius: 999px;
  background: #f7eff0;
  color: var(--theme-color, #9c0c13);
  font-size: 12px;
}

.service-list__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.service-list__grid :deep(.service-card) {
  min-width: 0;
  border: 1px solid #eceef1;
  box-shadow: none !important;
}

@media screen and (max-width: 1199px) {
  .service-list {
    width: 750px;
  }
}
</style>
