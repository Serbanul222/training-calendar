<template>
  <div class="training-calendar">
    <!-- Calendar Header with navigation and admin toggle -->
    <CalendarHeader
      :months="MONTHS"
      :current-year="currentYear"
      :selected-month="selectedMonth"
      :is-admin="isAdmin"
      @update:month="selectedMonth = $event"
      @update:year="currentYear = $event"
      @update:is-admin="updateAdminMode"
    />
    
    <!-- Category legend -->
    <CategoryLegend :categories="Object.values(TRAINING_CATEGORIES)" />
    
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">Loading calendar data...</div>
    
    <!-- Error message -->
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <!-- FullCalendar component -->
    <FullCalendar v-else ref="fullCalendar" :options="calendarOptions" />
    
    <!-- Event modal for creating/editing events -->
    <EventModal
      v-if="showEventForm"
      :show="showEventForm"
      :is-edit-mode="isEditMode"
      :event-data="eventForm"
      :categories="Object.values(TRAINING_CATEGORIES)"
      :event-date="selectedDate"
      @submit="handleEventSubmit"
      @close="closeEventForm"
    />
    
    <!-- Registration modal for registering for events -->
    <RegistrationModal
      v-if="showRegistrationForm"
      :show="showRegistrationForm"
      :event="selectedEventSnapshot"
      :categories="TRAINING_CATEGORIES"
      @submit="handleRegistrationSubmit"
      @close="closeRegistrationForm"
    />
    
    <!-- Confirmation modal -->
    <ConfirmationModal
      v-if="showConfirmationModal"
      :show="showConfirmationModal"
      :title="confirmationModalConfig.title"
      :message="confirmationModalConfig.message"
      :confirm-button-text="confirmationModalConfig.confirmButtonText"
      :cancel-button-text="confirmationModalConfig.cancelButtonText"
      :dangerous="confirmationModalConfig.dangerous"
      :show-cancel-button="confirmationModalConfig.showCancelButton"
      @confirm="confirmationModalConfig.onConfirm"
      @cancel="confirmationModalConfig.onCancel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import roLocale from '@fullcalendar/core/locales/ro';

import { MONTHS } from '../constants/months';
import { TRAINING_CATEGORIES } from '../constants/trainingCategories';

// Import components
import CalendarHeader from './CalendarHeader.vue';
import CategoryLegend from './CategoryLegend.vue';
import EventModal from './EventModal.vue';
import RegistrationModal from './RegistrationModal.vue';
import ConfirmationModal from './modals/ConfirmationModal.vue';

// Import composables and utils
import useCalendarEvents from '../composables/useCalendarEvents';
import useCalendarNavigation from '../composables/useCalendarNavigation';
import { createCalendarOptions, defaultEventContentRenderer } from '../utils/calendarConfig';
import { markRaw } from 'vue';

// Setup calendar and plugins
const fullCalendar = ref(null);
const plugins = markRaw([dayGridPlugin, interactionPlugin]);

// Setup composables
const { 
  events, loading, error, 
  loadEventsByMonth, deleteEvent, 
  submitEvent, registerForEvent 
} = useCalendarEvents();

const {
  currentYear, selectedMonth, selectedDate,
  handleDatesSet, forceCalendarRefresh,
  updateCalendarEditableOptions
} = useCalendarNavigation(fullCalendar);

// Admin state
const isAdmin = ref(localStorage.getItem('isAdmin') === 'true' || false);

// Modal states
const showEventForm = ref(false);
const showRegistrationForm = ref(false);
const showConfirmationModal = ref(false);
const isEditMode = ref(false);

// Form data
const eventForm = reactive({
  id: '', 
  category: 'CONSULTANTA', 
  location: '',
  maxParticipants: 10, 
  description: '', 
  participants: [], 
  date: ''
});

const selectedEventSnapshot = reactive({
  id: '', 
  title: '', 
  start: '', 
  end: '', 
  extendedProps: {}
});

const confirmationModalConfig = reactive({
  title: '',
  message: '',
  confirmButtonText: 'OK',
  cancelButtonText: 'Cancel',
  dangerous: false,
  showCancelButton: true,
  onConfirm: () => {},
  onCancel: () => {
    showConfirmationModal.value = false;
  }
});

// Calendar options
const calendarOptions = computed(() => createCalendarOptions({
  plugins,
  roLocale,
  events,
  isAdmin: isAdmin.value,
  currentYear: currentYear.value,
  selectedMonth: selectedMonth.value,
  onEventClick: handleEventClick,
  onDateClick: handleDateClick,
  onDatesSet: handleDatesSet,
  renderEventContent: defaultEventContentRenderer
}));

// Watch month/year changes
watch([currentYear, selectedMonth], async ([newYear, newMonth]) => {
  console.log(`Month/year changed to ${newMonth+1}/${newYear}`);
  await loadEventsByMonth(newYear, newMonth);
  // Let Vue's reactivity handle the update
});

// Update admin mode
function updateAdminMode(value) {
  isAdmin.value = value;
  localStorage.setItem('isAdmin', value);
  updateCalendarEditableOptions(fullCalendar, value);
}

// Handle clicking on an event
function handleEventClick(info) {
  const startDate = info.event.start ? new Date(info.event.start) : new Date();
  
  const eventData = {
    id: info.event.id,
    title: info.event.title,
    start: startDate.toISOString().split('T')[0],
    end: info.event.end ? new Date(info.event.end).toISOString().split('T')[0] : startDate.toISOString().split('T')[0],
    extendedProps: {
      category: info.event.extendedProps?.category || '',
      location: info.event.extendedProps?.location || '',
      maxParticipants: info.event.extendedProps?.maxParticipants || 0,
      description: info.event.extendedProps?.description || '',
      participants: info.event.extendedProps?.participants ? [...info.event.extendedProps.participants] : []
    }
  };
  
  if (isAdmin.value) {
    // Show edit/delete confirmation
    showConfirmationModal.value = true;
    confirmationModalConfig.title = 'Event Options';
    confirmationModalConfig.message = 'Do you want to edit this event?';
    confirmationModalConfig.confirmButtonText = 'Edit Event';
    confirmationModalConfig.cancelButtonText = 'Delete Event';
    confirmationModalConfig.dangerous = false;
    confirmationModalConfig.showCancelButton = true;
    confirmationModalConfig.onConfirm = () => {
      showConfirmationModal.value = false;
      prepareEditEvent(eventData, info);
    };
    confirmationModalConfig.onCancel = () => {
      showConfirmationModal.value = false;
      confirmDeleteEvent(eventData.id);
    };
  } else {
    // User mode - register for the event
    Object.assign(selectedEventSnapshot, eventData);
    showRegistrationForm.value = true;
  }
}

// Handle clicking on a date
function handleDateClick(info) {
  if (!isAdmin.value) return;
  
  isEditMode.value = false;
  selectedDate.value = info.dateStr;
  
  Object.assign(eventForm, {
    id: '', 
    category: 'CONSULTANTA', 
    location: '',
    maxParticipants: 10, 
    description: '', 
    participants: [], 
    date: info.dateStr
  });
  
  showEventForm.value = true;
}

// Prepare edit event
function prepareEditEvent(eventData, info) {
  isEditMode.value = true;
  
  Object.assign(eventForm, {
    id: eventData.id,
    category: eventData.extendedProps.category,
    location: eventData.extendedProps.location,
    maxParticipants: eventData.extendedProps.maxParticipants,
    description: eventData.extendedProps.description,
    participants: eventData.extendedProps.participants,
    date: info.event.startStr
  });
  
  showEventForm.value = true;
}

// Confirm delete event
function confirmDeleteEvent(eventId) {
  console.log('Confirming deletion of event:', eventId);
  showConfirmationModal.value = true;
  confirmationModalConfig.title = 'Delete Event';
  confirmationModalConfig.message = 'Are you sure you want to delete this event?';
  confirmationModalConfig.confirmButtonText = 'Delete';
  confirmationModalConfig.cancelButtonText = 'Cancel';
  confirmationModalConfig.dangerous = true;
  confirmationModalConfig.showCancelButton = true;
  confirmationModalConfig.onConfirm = async () => {
    console.log('Deleting event:', eventId);
    const success = await deleteEvent(eventId);
    showConfirmationModal.value = false;
    
    if (success) {
      console.log('Event deleted, reloading calendar data');
      // Just reload the events - let Vue reactivity handle the rest
      await loadEventsByMonth(currentYear.value, selectedMonth.value);
    }
  };
  confirmationModalConfig.onCancel = () => {
    showConfirmationModal.value = false;
  };
}

// Handle event submit
async function handleEventSubmit(formData) {
  const success = await submitEvent(formData, isEditMode.value);
  if (success) {
    closeEventForm();
    await loadEventsByMonth(currentYear.value, selectedMonth.value);
  }
}

// Handle registration submit
async function handleRegistrationSubmit(formData) {
  const result = await registerForEvent(formData);
  
  showConfirmationModal.value = true;
  confirmationModalConfig.title = result.success ? 'Success' : 'Error';
  confirmationModalConfig.message = result.message;
  confirmationModalConfig.confirmButtonText = 'OK';
  confirmationModalConfig.showCancelButton = false;
  confirmationModalConfig.dangerous = !result.success;
  confirmationModalConfig.onConfirm = async () => {
    showConfirmationModal.value = false;
    if (result.success) {
      closeRegistrationForm();
      // Just reload the events - let Vue reactivity handle the rest
      await loadEventsByMonth(currentYear.value, selectedMonth.value);
    }
  };
}

// Close modals
function closeEventForm() {
  showEventForm.value = false;
  Object.assign(eventForm, { 
    id: '', 
    category: 'CONSULTANTA', 
    location: '', 
    maxParticipants: 10, 
    description: '', 
    participants: [], 
    date: '' 
  });
}

function closeRegistrationForm() {
  showRegistrationForm.value = false;
  Object.assign(selectedEventSnapshot, { 
    id: '', 
    title: '', 
    start: '', 
    end: '', 
    extendedProps: {} 
  });
}

// Load events on mount
onMounted(async () => {
  console.log('TrainingCalendar component mounted');
  await loadEventsByMonth(currentYear.value, selectedMonth.value);
});

// Set up auto-refresh interval with less frequent updates
const refreshInterval = setInterval(async () => {
  console.log('Periodic events refresh');
  await loadEventsByMonth(currentYear.value, selectedMonth.value);
}, 60000); // Every 60 seconds

// Clean up interval on component unmount
onUnmounted(() => {
  console.log('Clearing refresh interval');
  clearInterval(refreshInterval);
});
</script>

<style scoped>
.training-calendar {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.loading-indicator {
  padding: 2rem;
  text-align: center;
  font-style: italic;
  color: #666;
}

.error-message {
  padding: 1rem;
  background-color: #fff3f3;
  color: #e51c23;
  border-radius: 4px;
  margin-bottom: 1rem;
}

/* FullCalendar custom styles */
:deep(.fc) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

:deep(.fc-daygrid-day-number) {
  font-size: 0.9rem;
  padding: 0.3rem 0.6rem;
}

:deep(.fc-event) {
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
}

:deep(.fc-event-title) {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>