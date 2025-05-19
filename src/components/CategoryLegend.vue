<template>
  <div class="category-legend">
    <div 
      v-for="category in categories" 
      :key="category.id" 
      class="category-item"
      :style="{ 
        backgroundColor: category.backColor,
        borderLeft: `4px solid ${category.color}`
      }"
    >
      {{ category.name }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.category-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-item {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
}
</style>