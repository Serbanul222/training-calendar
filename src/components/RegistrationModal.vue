<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Register for Event</h3>
        <button @click="handleClose" class="close-btn">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="event-details">
          <p><strong>Date:</strong> {{ formatEventDate }}</p>
          <p><strong>Event:</strong> {{ eventTitle }}</p>
          <p><strong>Available Spots:</strong> {{ availableSpots }}</p>
          <p v-if="eventDescription"><strong>Description:</strong> {{ eventDescription }}</p>
        </div>
        
        <form @submit.prevent="submitForm" class="registration-form">
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
            <label for="participantName">Your Name:</label>
            <input 
              type="text" 
              id="participantName" 
              v-model="formData.participantName" 
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
            <label for="storeLocation">Store Location:</label>
            <input 
              type="text" 
              id="storeLocation" 
              v-model="formData.location" 
              required
            >
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-submit" 
              :disabled="isEventFull"
            >
              Register
            </button>
            <button 
              type="button" 
              @click="handleClose" 
              class="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div v-if="isEventFull" class="error-message">
          This event is already full. Please select another event.
        </div>
        
        <!-- Only show participants if there are any -->
        <div v-if="hasParticipants" class="participant-list">
          <h4>Current Participants ({{ participantsCount }}):</h4>
          <ul>
            <li v-for="(participant, index) in participantsList" :key="index">
              {{ participantName(participant) }}
              <span v-if="participant.location"> from {{ participant.location }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  event: {
    type: Object,
    default: null
  },
  categories: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['submit', 'close']);

// Extract event data once on mount to prevent reactivity issues
const eventId = ref('');
const eventDate = ref('');
const eventTitle = ref('');
const eventDescription = ref('');
const eventMaxParticipants = ref(0);
const participantsList = ref([]);

// Extract event data to local refs
onMounted(() => {
  if (props.event) {
    eventId.value = props.event.id || '';
    eventDate.value = props.event.start || '';
    eventTitle.value = props.event.title || getEventTitleFromProps();
    eventDescription.value = props.event?.extendedProps?.description || '';
    eventMaxParticipants.value = props.event?.extendedProps?.maxParticipants || 0;
    participantsList.value = props.event?.extendedProps?.participants || [];
  }
});

// Registration form data
const formData = ref({
  participantEmail: '',
  participantName: '',
  managerEmail: '',
  location: ''
});

// Compute values once to prevent recalculation
const participantsCount = computed(() => {
  return participantsList.value.length;
});

const hasParticipants = computed(() => {
  return participantsCount.value > 0;
});

const availableSpots = computed(() => {
  return `${participantsCount.value}/${eventMaxParticipants.value}`;
});

const isEventFull = computed(() => {
  return participantsCount.value >= eventMaxParticipants.value;
});

// Safely format the event date, handling different date formats
const formatEventDate = computed(() => {
  if (!eventDate.value) return '';
  
  try {
    // Handle Date object
    if (eventDate.value instanceof Date) {
      return format(eventDate.value, 'd MMMM yyyy', { locale: ro });
    }
    
    // Handle ISO string
    if (typeof eventDate.value === 'string' && eventDate.value.includes('T')) {
      return format(new Date(eventDate.value), 'd MMMM yyyy', { locale: ro });
    }
    
    // Handle YYYY-MM-DD string
    if (typeof eventDate.value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(eventDate.value)) {
      return format(new Date(eventDate.value), 'd MMMM yyyy', { locale: ro });
    }
    
    // Fallback - try to parse as ISO string
    return format(parseISO(String(eventDate.value)), 'd MMMM yyyy', { locale: ro });
  } catch (e) {
    console.error('Error formatting date, using fallback format');
    // If all else fails, just return the raw date string
    return eventDate.value ? String(eventDate.value).split('T')[0] : '';
  }
});

// Helper function to get event title from props
function getEventTitleFromProps() {
  if (!props.event) return '';
  if (props.event.title) return props.event.title;
  
  const category = props.categories[props.event.extendedProps?.category];
  return `${category?.name || ''} - ${props.event.extendedProps?.location || ''}`;
}

// Helper to get participant name
function participantName(participant) {
  return participant.participantName || participant.participantEmail;
}

// Submit form - prevent submission if event is full
function submitForm() {
  if (isEventFull.value) return;
  
  emit('submit', {
    ...formData.value,
    eventId: eventId.value
  });
  
  // Reset form after submission
  formData.value = {
    participantEmail: '',
    participantName: '',
    managerEmail: '',
    location: ''
  };
}

// Handle modal close
function handleClose() {
  emit('close');
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

.event-details {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
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

.btn-submit:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
}

.participant-list {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.participant-list h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.participant-list ul {
  margin: 0;
  padding-left: 1.5rem;
}

.participant-list li {
  margin-bottom: 0.25rem;
}
</style>