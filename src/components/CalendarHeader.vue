<template>
  <div>
    <!-- Admin/User toggle switch -->
    <div class="mode-switch">
      <label class="switch">
        <input type="checkbox" :checked="isAdmin" @change="$emit('update:isAdmin', $event.target.checked)">
        <span class="slider round"></span>
      </label>
      <span>{{ isAdmin ? 'Admin Mode' : 'User Mode' }}</span>
    </div>
    
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
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:month', 'update:year', 'update:isAdmin']);

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

.mode-switch {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  justify-content: flex-end;
}

/* Toggle switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-right: 0.5rem;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #4a86e8;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>