<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h3>
        <button @click="$emit('close')" class="close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="eventCategory">Category:</label>
            <select id="eventCategory" v-model="formData.category" required>
              <option value="" disabled>Select a category</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="eventLocation">Location:</label>
            <input type="text" id="eventLocation" v-model="formData.location" required>
          </div>
          
          <div class="form-group">
            <label for="eventMaxParticipants">Max Participants:</label>
            <input 
              type="number" 
              id="eventMaxParticipants" 
              v-model.number="formData.maxParticipants" 
              min="1"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="eventDescription">Description:</label>
            <textarea 
              id="eventDescription" 
              v-model="formData.description" 
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn-submit">
              {{ isEditMode ? 'Update' : 'Create Event' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  eventData: {
    type: Object,
    default: () => ({})
  },
  categories: {
    type: Array,
    required: true
  },
  eventDate: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['submit', 'close']);

// Local form data
const formData = ref({
  id: '',
  category: 'CONSULTANTA',
  location: '',
  maxParticipants: 10,
  description: '',
  participants: [],
  date: ''
});

// Watch for changes in props to update form data
watch(() => props.eventData, (newValue) => {
  if (newValue && props.isEditMode) {
    formData.value = {
      id: newValue.id || '',
      category: newValue.category || 'CONSULTANTA',
      location: newValue.location || '',
      maxParticipants: newValue.maxParticipants || 10,
      description: newValue.description || '',
      participants: newValue.participants || [],
      date: newValue.date || props.eventDate
    };
  } else {
    // For new events
    formData.value = {
      id: '',
      category: 'CONSULTANTA',
      location: '',
      maxParticipants: 10,
      description: '',
      participants: [],
      date: props.eventDate
    };
  }
}, { immediate: true });

// Submit form
function submitForm() {
  console.log('EventModal submitting form with date:', formData.value.date);
  emit('submit', { 
    ...formData.value,
    // Ensure the date is properly passed
    date: formData.value.date || props.eventDate
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.modal-body {
  padding: 1rem;
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
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.btn-submit {
  background-color: #4a86e8;
  color: white;
}

.btn-cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}
</style>