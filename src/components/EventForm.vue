<template>
  <div class="event-form">
    <h2>{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h2>
    
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="eventDate">Training Date:</label>
        <input 
          type="date" 
          id="eventDate" 
          v-model="formData.eventDate" 
          required
          :disabled="datePreselected"
        >
      </div>
      
      <div class="form-group">
        <label for="category">Category:</label>
        <select 
          id="category" 
          v-model="formData.category" 
          required
        >
          <option value="" disabled>Select a category</option>
          <option 
            v-for="category in categoryOptions" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="location">Store/Location:</label>
        <input 
          type="text" 
          id="location" 
          v-model="formData.location" 
          required
        >
      </div>
      
      <div class="form-group">
        <label for="maxParticipants">Maximum Number of Participants:</label>
        <input 
          type="number" 
          id="maxParticipants" 
          v-model.number="formData.maxParticipants" 
          min="1"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="description">Description (optional):</label>
        <textarea 
          id="description" 
          v-model="formData.description" 
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="cancelForm" class="btn-cancel">
          Cancel
        </button>
        <button type="submit" class="btn-submit">
          {{ isEditMode ? 'Update' : 'Create Event' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { TRAINING_CATEGORIES } from '../constants/trainingCategories';

const props = defineProps({
  initialDate: {
    type: String,
    default: null
  },
  editMode: {
    type: Boolean,
    default: false
  },
  eventToEdit: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['event-added', 'event-updated', 'cancel']);

// Default form data
const defaultFormData = {
  eventDate: props.initialDate || new Date().toISOString().split('T')[0],
  category: '',
  location: '',
  maxParticipants: 10,
  description: '',
  participants: []
};

const formData = ref({ ...defaultFormData });

// Check if date is preselected
const datePreselected = computed(() => !!props.initialDate);

// Check if in edit mode
const isEditMode = computed(() => props.editMode);

// Category options from constants
const categoryOptions = computed(() => Object.values(TRAINING_CATEGORIES));

// If in edit mode, populate form with event data
watch(() => props.eventToEdit, (newVal) => {
  if (newVal) {
    formData.value = {
      eventDate: newVal.start || new Date().toISOString().split('T')[0],
      category: newVal.extendedProps?.category || '',
      location: newVal.extendedProps?.location || '',
      maxParticipants: newVal.extendedProps?.maxParticipants || 10,
      description: newVal.extendedProps?.description || '',
      participants: newVal.extendedProps?.participants || []
    };
  }
}, { immediate: true });

// Submit form
const submitForm = () => {
  if (isEditMode.value) {
    emit('event-updated', {
      ...formData.value,
      id: props.eventToEdit?.id
    });
  } else {
    // For new events, initialize with empty participants array
    emit('event-added', { 
      ...formData.value,
      id: Date.now().toString(),
      participants: []
    });
  }
  
  // Reset form
  if (!isEditMode.value) {
    resetForm();
  }
};

// Cancel form
const cancelForm = () => {
  resetForm();
  emit('cancel');
};

// Reset form to defaults
const resetForm = () => {
  formData.value = { ...defaultFormData };
};
</script>

<style scoped>
.event-form {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.event-form h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.btn-cancel {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #333;
}

.btn-submit {
  background-color: #4a86e8;
  color: white;
}

.btn-cancel:hover {
  background-color: #e9ecef;
}

.btn-submit:hover {
  background-color: #3b78e7;
}
</style>