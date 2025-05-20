<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="eventName">Event Name:</label>
            <!-- The newline from unstable-code was removed as 9nz1zf-codex didn't have it -->
            <input type="text" id="eventName" v-model="formData.name" required>
          </div>

          <div class="form-group">
            <label for="eventCategory">Category:</label>
            <select id="eventCategory" v-model="formData.category">
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
            <label for="eventDate">Date:</label>
            <input
              type="date"
              id="eventDate"
              v-model="formData.date"
              required
              :disabled="datePreselected"
            >
          </div>

          <!-- Add time selection fields -->
          <div class="form-row">
            <div class="form-group form-group-half">
              <label for="eventStartTime">Start Time:</label>
              <input
                type="time"
                id="eventStartTime"
                v-model="formData.startTime"
                required
                @change="validateTimes"
              >
            </div>

            <div class="form-group form-group-half">
              <label for="eventEndTime">End Time:</label>
              <input
                type="time"
                id="eventEndTime"
                v-model="formData.endTime"
                required
                @change="validateTimes"
              >
            </div>
          </div>

          <!-- Time conflict warning -->
          <div v-if="timeConflict" class="form-error">
            <p>This time slot conflicts with another event. Please choose a different time.</p>
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

          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="form-actions">
            <button type="button" @click="$emit('close')" class="btn-cancel">
              Cancel
            </button>
            <button
              type="submit"
              class="btn-submit"
              :disabled="loading || timeConflict"
            >
              {{ isEditMode ? 'Update' : 'Create Event' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import useCalendarEvents from '../composables/useCalendarEvents';

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

// Load calendar events composable for time conflict checking
const { checkTimeConflict } = useCalendarEvents();

// Local state
const loading = ref(false);
const error = ref(null);
const timeConflict = ref(false);

// Local form data
const formData = reactive({
  id: '',
  name: '', // Kept single 'name' property, assuming the duplicate was an error.
  category: 'CONSULTANTA',
  location: '',
  date: '',
  startTime: '09:00', // Default start time
  endTime: '17:00',   // Default end time
  maxParticipants: 10,
  description: '',
  participants: []
});

// Check if date is preselected
const datePreselected = computed(() => !!props.eventDate);

// Watch for changes in props to update form data
watch(() => props.eventData, (newValue) => {
  if (newValue && Object.keys(newValue).length > 0) { // Ensure newValue is not an empty object
    formData.id = newValue.id || '';
    formData.name = newValue.name || ''; // Use the single name property
    formData.category = newValue.category || 'CONSULTANTA';
    formData.location = newValue.location || '';
    formData.date = newValue.date || (props.isEditMode ? '' : props.eventDate); // Use props.eventDate for new events if available
    formData.startTime = newValue.startTime || '09:00';
    formData.endTime = newValue.endTime || '17:00';
    formData.maxParticipants = newValue.maxParticipants || 10;
    formData.description = newValue.description || '';
    formData.participants = newValue.participants || [];

    // If it's a new event and eventDate prop is provided, use it
    if (!props.isEditMode && props.eventDate) {
        formData.date = props.eventDate;
    }

    checkForTimeConflicts(); // Check conflicts when data changes
  } else {
    // For new events or if props.eventData is empty
    formData.id = '';
    formData.name = '';
    formData.category = 'CONSULTANTA'; // Default category
    formData.location = '';
    formData.date = props.eventDate || new Date().toISOString().split('T')[0]; // Default to today if props.eventDate is not set
    formData.startTime = '09:00';
    formData.endTime = '17:00';
    formData.maxParticipants = 10;
    formData.description = '';
    formData.participants = [];
    timeConflict.value = false; // Reset time conflict for new forms
    error.value = null; // Reset error for new forms
  }
}, { immediate: true, deep: true }); // Added deep: true for better reactivity with object props

// Watch for changes to date/time fields to check for conflicts
watch(() => [formData.date, formData.startTime, formData.endTime], () => {
  if (formData.date && formData.startTime && formData.endTime) {
    checkForTimeConflicts();
  }
}, { deep: true });

// Validate that end time is after start time
function validateTimes() {
  if (formData.startTime && formData.endTime) {
    if (formData.endTime <= formData.startTime) {
      error.value = 'End time must be after start time';
      timeConflict.value = false; // Not a server conflict, but a validation error
      return false;
    }
    // Clear only time validation error, not server conflict error
    if (error.value === 'End time must be after start time') {
        error.value = null;
    }
    return true;
  }
  return true;
}

// Check for time conflicts with existing events
async function checkForTimeConflicts() {
  if (!formData.date || !formData.startTime || !formData.endTime) {
    timeConflict.value = false; // Cannot check if date/time is missing
    return;
  }
  // Basic time validation first
  if (formData.endTime <= formData.startTime) {
      timeConflict.value = false; // Not a server conflict
      // error.value is handled by validateTimes
      return;
  }

  try {
    loading.value = true; // Indicate activity
    const hasConflict = await checkTimeConflict(
      formData.date,
      formData.startTime,
      formData.endTime,
      props.isEditMode ? formData.id : null
    );

    timeConflict.value = hasConflict;
    if (hasConflict) {
      error.value = 'This time slot conflicts with another event.';
    } else {
      // Clear conflict-specific error, preserve other errors (like time validation)
      if (error.value === 'This time slot conflicts with another event.') {
          error.value = null;
      }
    }
  } catch (err) {
    console.error('Error checking time conflicts:', err);
    error.value = 'Could not verify time slot. Please try again.'; // Generic error for API failure
  } finally {
    loading.value = false;
  }
}

// Submit form
async function submitForm() { // Made async to await conflict check if needed
  loading.value = true;
  error.value = null;

  try {
    // Prioritize 9nz1zf-codex order: name, date, location
    if (!formData.name || !formData.date || !formData.location ||
        !formData.startTime || !formData.endTime) {
      error.value = 'Please fill in all required fields.';
      loading.value = false;
      return;
    }

    if (!validateTimes()) {
      loading.value = false;
      return;
    }

    // Re-check conflict right before submit to be sure, especially if auto-check failed or was slow
    await checkForTimeConflicts();
    if (timeConflict.value) {
      error.value = 'This time slot conflicts with another event. Please choose a different time.';
      loading.value = false;
      return;
    }

    emit('submit', { ...formData });
  } catch (err) {
    error.value = 'An error occurred while submitting. Please try again.';
    console.error('Submit error:', err);
  } finally {
    loading.value = false;
  }
}

// Set initial check for time conflicts when component is mounted or props change that set initial data
onMounted(() => {
  // The watch on props.eventData with immediate: true handles initial setup.
  // This onMounted might be redundant or could be used for a final check.
  if (props.show && formData.date && formData.startTime && formData.endTime) {
    checkForTimeConflicts();
  }
});

// Ensure form data is reset or correctly set when the modal is shown/hidden or mode changes
watch(() => props.show, (newShowState) => {
    if (newShowState) {
        // When modal is shown, re-evaluate initial form data based on current props
        const currentEventData = props.eventData;
        if (props.isEditMode && currentEventData && Object.keys(currentEventData).length > 0) {
            formData.id = currentEventData.id || '';
            formData.name = currentEventData.name || '';
            formData.category = currentEventData.category || 'CONSULTANTA';
            formData.location = currentEventData.location || '';
            formData.date = currentEventData.date || '';
            formData.startTime = currentEventData.startTime || '09:00';
            formData.endTime = currentEventData.endTime || '17:00';
            formData.maxParticipants = currentEventData.maxParticipants || 10;
            formData.description = currentEventData.description || '';
            formData.participants = currentEventData.participants || [];
        } else { // New event
            formData.id = '';
            formData.name = '';
            formData.category = 'CONSULTANTA';
            formData.location = '';
            formData.date = props.eventDate || new Date().toISOString().split('T')[0];
            formData.startTime = '09:00';
            formData.endTime = '17:00';
            formData.maxParticipants = 10;
            formData.description = '';
            formData.participants = [];
        }
        timeConflict.value = false; // Reset conflict state
        error.value = null;      // Reset error state
        checkForTimeConflicts(); // Perform initial conflict check
    }
});

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

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group-half {
  flex: 1;
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

.form-error {
  background-color: #fff5f5;
  border-left: 3px solid #e74c3c;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  color: #e74c3c;
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #fff5f5;
  border-radius: 4px;
  border-left: 3px solid #dc3545;
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
  background-color: #a9c2f5;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
}
</style>