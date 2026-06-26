<template>
    <div class="container">
        <transition name="editor-fade" mode="out-in">
            <html-editor
                v-if="displayData.type === 'html'"
                :key="'html'"
                ref="htmlEditorRef"
                :init-data="displayData"
                :type="'preview'"
            />
            <div v-else-if="displayData.type === 'md'" :key="'md'" class="md-container">
                <MdPreview :id="mdId" :modelValue="displayData.content" style="border: none;" />
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import HtmlEditor from './HtmlEditor.vue';
import { copy } from '@/utils/other';

const mdId = 'preview-only';

const props = defineProps({
    initData: {
        type: Object,
        default: () => ({
            type: null,
            content: null,
            title: '',
        }),
    },
});

const displayData = ref(copy(props.initData));

watch(
    () => props.initData,
    (value) => {
        displayData.value = copy(value);
    },
    { deep: true },
);
</script>

<style scoped>
@media screen and (min-width: 1000px) {
    .container {
        width: 1000px;
        padding: 5px;
        border: #e0e0e0 1px solid;
        background-color: #ffffff;
    }
    .displayer {
        width: 100%;
        overflow-y: auto;
    }
    .md-container {
        padding: 10px;
    }
}

@media screen and (max-width: 1000px) {
    .container {
        width: 100vw;
        background-color: #ffffff;
    }
    .displayer {
        width: 100%;
        overflow-y: auto;
    }
    .md-container {
        padding: 5px;
    }
}

.editor-fade-enter-active {
    transition: opacity 0.2s ease-in;
}

.editor-fade-leave-active {
    transition: opacity 0.15s ease-out;
}

.editor-fade-enter-from,
.editor-fade-leave-to {
    opacity: 0;
}

.editor-fade-enter-to,
.editor-fade-leave-from {
    opacity: 1;
}

:deep(.md-editor-code-head) {
    z-index: auto !important;
}
</style>
