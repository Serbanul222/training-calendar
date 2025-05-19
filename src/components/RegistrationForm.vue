<template>
  <div class="registration-form">
    <h2>Register for Training Event</h2>
    
    <div class="event-details">
      <p><strong>Date:</strong> {{ formatDate(event?.start) }}</p>
      <p><strong>Category:</strong> {{ getCategoryName(event?.extendedProps?.category) }}</p>
      <p><strong>Location:</strong> {{ event?.extendedProps?.location }}</p>
      <p><strong>Available Spots:</strong> {{ getAvailableSpots(event) }}</p>
    </div>
    
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="participantEmail">Your Email:</label>
        <input 
          type="email" 
          id="participantEmail" 
          v-model="formData.participantEmail" 
          required
        >
      </div>
      
      <div class="form-group">
        <label for="managerEmail">Manager Email:</label>
        <input 
          type="email" 
          id="managerEmail" 
          v-model="formData.managerEmail" 
          required
        >
      </div>
      
      <div class="form-group">
        <label for="location">Store Location:</label>
        <input 
          type="text" 
          id="location" 
          v-model="formData.location" 
          required
        >
      </div>
      
      <div class="form-actions">
        <button type="button" @click="cancelForm" class="btn-cancel">
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn-submit"
          :disabled="isEventFull(event)"
        >
          Register
        </button>
      </div>
    </form>
    
    <p v-if="isEventFull(event)" class="error-message">
      This event is already full. Please select another event.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { TRAINING_CATEGORIES } from '../constants/trainingCategories';

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['registration-submitted', 'cancel']);

// Default form data
const formData = ref({
  participantEmail: '',
  managerEmail: '',
  location: ''
});

// Format date for display
const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'd MMMM yyyy', { locale: ro });
  } catch (e) {
    return date;
  }
};

// Get category name
const getCategoryName = (categoryId) => {
  if (!categoryId) return '';
  return TRAINING_CATEGORIES[categoryId]?.name || '';
};

// Get available spots
const getAvailableSpots = (event) => {
  if (!event) return '0/0';
  const participants = event.extendedProps?.participants || [];
  const maxParticipants = event.extendedProps?.maxParticipants || 0;
  return `${participants.length}/${maxParticipants}`;
};

// Check if event is full
const isEventFull = (event) => {
  if (!event) return true;
  const participants = event.extendedProps?.participants || [];
  const maxParticipants = event.extendedProps?.maxParticipants || 0;
  return participants.length >= maxParticipants;
};

// Submit form
const submitForm = () => {
  if (isEventFull(props.event)) return;
  
  emit('registration-submitted', {
    ...formData.value,
    eventId: props.event.id
  });
  
  // Reset form
  resetForm();
};

// Cancel form
const cancelForm = () => {
  resetForm();
  emit('cancel');
};

// Reset form to defaults
const resetForm = () => {
  formData.value = {
    participantEmail: '',
    managerEmail: '',
    location: ''
  };
};
</script>

<style scoped>
.registration-form {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.registration-form h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.event-details {
  background-color: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
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

.btn-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-cancel:hover {
  background-color: #e9ecef;
}

.btn-submit:hover:not(:disabled) {
  background-color: #3b78e7;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  text-align: center;
}
</style>