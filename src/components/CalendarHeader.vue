<template>
  <div>
    <!-- Month navigation -->
    <div class="calendar-header">
      <div class="month-navigation">
        <button @click="prevMonth" class="nav-btn">&lt;</button>
        <select
          :value="selectedMonth"
          @change="$emit('update:month', parseInt($event.target.value))"
          class="month-select"
        >
          <option v-for="(month, index) in months" :key="index" :value="index">
            {{ month }}
          </option>
        </select>
        <span class="year-display">{{ currentYear }}</span>
        <button @click="nextMonth" class="nav-btn">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  months: {
    type: Array,
    required: true
  },
  currentYear: {
    type: Number,
    required: true
  },
  selectedMonth: {
    type: Number,
    required: true
  }
  // Removed isAdmin prop as it's no longer needed with RBAC
});

const emit = defineEmits(['update:month', 'update:year']);
// Removed 'update:isAdmin' from emits since we don't need to update isAdmin anymore

// Navigation methods
function prevMonth() {
  if (props.selectedMonth === 0) {
    emit('update:month', 11);
    emit('update:year', props.currentYear - 1);
  } else {
    emit('update:month', props.selectedMonth - 1);
  }
}

function nextMonth() {
  if (props.selectedMonth === 11) {
    emit('update:month', 0);
    emit('update:year', props.currentYear + 1);
  } else {
    emit('update:month', props.selectedMonth + 1);
  }
}
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.month-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
  min-width: 150px;
}

.year-display {
  font-weight: bold;
  margin: 0 0.5rem;
}

.nav-btn {
  background-color: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  cursor: pointer;
}

.nav-btn:hover {
  background-color: #e9ecef;
}
</style>