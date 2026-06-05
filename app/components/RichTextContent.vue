<template>
  <div
    v-if="html"
    class="rich-text"
    v-html="html"
  />
</template>

<script setup lang="ts">
import { richTextToDisplayHtml } from '~/utils/richText'

const props = defineProps<{
  content?: string | null
}>()

const html = computed(() => richTextToDisplayHtml(props.content))
</script>

<style scoped>
.rich-text {
  color: #9ca3af;
  font-size: 0.95rem;
  line-height: 1.75;
}
.rich-text :deep(h2) {
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: #f9fafb;
  font-size: 1.25rem;
  font-weight: 800;
}
.rich-text :deep(h3) {
  margin-top: 1rem;
  margin-bottom: 0.4rem;
  color: #f9fafb;
  font-size: 1.05rem;
  font-weight: 800;
}
.rich-text :deep(p) {
  margin: 0.5rem 0;
}
.rich-text :deep(ul),
.rich-text :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.35rem;
}
.rich-text :deep(ul) {
  list-style: disc;
}
.rich-text :deep(ol) {
  list-style: decimal;
}
.rich-text :deep(li) {
  margin: 0.25rem 0;
}
.rich-text :deep(blockquote) {
  margin: 1rem 0;
  border-left: 3px solid #22c55e;
  padding-left: 0.9rem;
  color: #d1d5db;
}
.rich-text :deep(a) {
  color: #86efac;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
