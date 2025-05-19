<template>
  <div class="view-switcher">
    <button
      v-for="view in views"
      :key="view.value"
      @click="switchView(view.value)"
      :class="{ active: currentView === view.value }"
      :title="view.tooltip"
    >
      {{ view.label }}
    </button>
  </div>
</template>

<script setup>
// No need to import defineProps and defineEmits as they are compiler macros
const props = defineProps({
  currentView: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:view']);

const views = [
  { value: 'dayGridMonth', label: 'Month', tooltip: 'Month view' },
  { value: 'timeGridWeek', label: 'Week', tooltip: 'Week view with time slots' },
  { value: 'timeGridDay', label: 'Day', tooltip: 'Day view with detailed time slots' }
];

function switchView(viewType) {
  emit('update:view', viewType);
}
</script>

<style scoped>
.view-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.view-switcher button {
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.view-switcher button.active {
  background-color: #4a86e8;
  color: white;
  border-color: #4a86e8;
}

.view-switcher button:hover:not(.active) {
  background-color: #e9ecef;
  border-color: #ced4da;
}
</style>