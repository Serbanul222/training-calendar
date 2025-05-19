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
    
    <!-- FullCalendar component -->
    <FullCalendar
      ref="fullCalendar"
      :options="calendarOptions"
    />
    
    <!-- Event modal for creating/editing events -->
    <EventModal
      v-if="showEventForm"
      :show="showEventForm"
      :is-edit-mode="isEditMode"
      :event-data="eventForm"
      :categories="Object.values(TRAINING_CATEGORIES)"
      :event-date="selectedDate"
      @submit="submitEventForm"
      @close="closeEventForm"
    />
    
    <!-- Registration modal for registering for events -->
    <RegistrationModal
      v-if="showRegistrationForm"
      :show="showRegistrationForm"
      :event="selectedEventSnapshot"
      :categories="TRAINING_CATEGORIES"
      @submit="submitRegistration"
      @close="closeRegistrationForm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, markRaw } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import roLocale from '@fullcalendar/core/locales/ro';

import { MONTHS } from '../constants/months';
import { TRAINING_CATEGORIES } from '../constants/trainingCategories';
import { useEventStore } from '../store/eventStore';

// Import components
import CalendarHeader from './CalendarHeader.vue';
import CategoryLegend from './CategoryLegend.vue';
import EventModal from './EventModal.vue';
import RegistrationModal from './RegistrationModal.vue';

// Mark the plugins as raw to prevent Vue from trying to make them reactive
const plugins = markRaw([dayGridPlugin, interactionPlugin]);

// Setup store and state - use standard refs for primitives
const eventStore = useEventStore();
const fullCalendar = ref(null);

// Calendar state
const isAdmin = ref(localStorage.getItem('isAdmin') === 'true' || false);
const currentYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth());
const selectedDate = ref('');

// Modal state
const showEventForm = ref(false);
const showRegistrationForm = ref(false);
const isEditMode = ref(false);

// Store event data as plain objects not reactive objects
// This prevents recursion issues
const eventForm = reactive({
  id: '',
  category: 'CONSULTANTA',
  location: '',
  maxParticipants: 10,
  description: '',
  participants: [],
  date: ''
});

// Use a plain object for selected event instead of a reactive reference
const selectedEventSnapshot = reactive({
  id: '',
  title: '',
  start: '',
  end: '',
  extendedProps: {}
});

// Create a stable calendar options object that won't change often
const calendarOptions = computed(() => {
  return {
    plugins,
    initialView: 'dayGridMonth',
    locale: roLocale,
    firstDay: 1, // Monday
    headerToolbar: false, // We'll create our own header
    events: eventStore.events,
    selectable: isAdmin.value,
    editable: isAdmin.value,
    eventClick: markRaw(handleEventClick),
    dateClick: markRaw(handleDateClick),
    eventContent: markRaw(renderEventContent),
    datesSet: markRaw(handleDatesSet),
    height: 'auto', // Dynamically adjust height based on content
    displayEventEnd: false, // Since all events are all-day
    dayMaxEventRows: true, // Better performance for event display
    initialDate: new Date(currentYear.value, selectedMonth.value, 1)
  };
});

// Update admin mode
function updateAdminMode(value) {
  isAdmin.value = value;
  localStorage.setItem('isAdmin', value);
  
  // Update calendar editable properties
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    calendarApi.setOption('selectable', value);
    calendarApi.setOption('editable', value);
  }
}

// Update displayed dates based on calendar navigation
function handleDatesSet(arg) {
  const date = arg.view.currentStart;
  currentYear.value = date.getFullYear();
  selectedMonth.value = date.getMonth();
}

// Handle clicking on an event
function handleEventClick(info) {
  // Create a snapshot of the event data (a plain object, not reactive)
  const startDate = info.event.start ? new Date(info.event.start) : new Date();
  
  const eventData = {
    id: info.event.id,
    title: info.event.title,
    start: startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
    end: info.event.end ? new Date(info.event.end).toISOString().split('T')[0] : startDate.toISOString().split('T')[0],
    extendedProps: {
      category: info.event.extendedProps?.category || '',
      location: info.event.extendedProps?.location || '',
      maxParticipants: info.event.extendedProps?.maxParticipants || 0,
      description: info.event.extendedProps?.description || '',
      participants: info.event.extendedProps?.participants 
        ? [...info.event.extendedProps.participants] 
        : []
    }
  };
  
  if (isAdmin.value) {
    // Admin mode - show options to edit or delete
    const confirmAction = window.confirm('Do you want to edit this event? Click Cancel to delete it instead.');
    
    if (confirmAction) {
      // Edit mode
      isEditMode.value = true;
      
      // Reset and then set event form data
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
    } else {
      // Delete mode
      if (window.confirm('Are you sure you want to delete this event?')) {
        deleteEvent(eventData.id);
      }
    }
  } else {
    // User mode - register for the event
    // Copy to the snapshot object - don't make a new reactive reference
    Object.assign(selectedEventSnapshot, eventData);
    showRegistrationForm.value = true;
  }
}

// Handle clicking on a date
function handleDateClick(info) {
  if (!isAdmin.value) return;
  
  // Create a new event
  isEditMode.value = false;
  selectedDate.value = info.dateStr;
  
  // Reset and set event form
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

// Custom event rendering
function renderEventContent(eventInfo) {
  try {
    // Use the pre-formatted title which already includes participant info
    return {
      html: `
        <div class="fc-event-main-content">
          <div class="fc-event-title">${eventInfo.event.title}</div>
        </div>
      `
    };
  } catch (error) {
    return {
      html: `<div class="fc-event-main-content"><div class="fc-event-title">${eventInfo.event.title}</div></div>`
    };
  }
}

// Force refresh the calendar - simplified to avoid recursion
function forceCalendarRefresh() {
  if (!fullCalendar.value || !fullCalendar.value.getApi) return;
  
  try {
    const api = fullCalendar.value.getApi();
    api.refetchEvents();
  } catch (error) {
    console.error('Error refreshing calendar:', error);
  }
}

// Delete an event
function deleteEvent(eventId) {
  const success = eventStore.deleteEvent(eventId);
  
  if (success) {
    console.log('Event deleted successfully');
    forceCalendarRefresh();
  } else {
    console.error('Failed to delete event');
  }
}

// Event form submission handling
function submitEventForm(formData) {
  // Make a plain object copy of the form data
  const eventData = { ...formData };
  
  // Make sure we have a date
  if (!eventData.date) {
    eventData.date = selectedDate.value;
  }
  
  let result;
  if (isEditMode.value) {
    // Update existing event
    result = eventStore.updateEvent(eventData);
  } else {
    // Create new event
    result = eventStore.addEvent(eventData);
  }
  
  if (result) {
    console.log('Event saved successfully');
  } else {
    console.error('Failed to save event');
  }
  
  closeEventForm();
  forceCalendarRefresh();
}

// Registration form submission handling
function submitRegistration(formData) {
  // Create a plain object for the participant
  const participant = {
    id: Date.now().toString(),
    participantEmail: formData.participantEmail,
    participantName: formData.participantName,
    managerEmail: formData.managerEmail,
    location: formData.location
  };
  
  const success = eventStore.addParticipant(formData.eventId, participant);
  
  if (success) {
    alert('Registration successful!');
    closeRegistrationForm();
    forceCalendarRefresh(); // Refresh to show updated participant count
  } else {
    alert('Registration failed. The event might be full.');
  }
}

// Close event form modal
function closeEventForm() {
  showEventForm.value = false;
  
  // Reset form
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

// Close registration form modal
function closeRegistrationForm() {
  showRegistrationForm.value = false;
  
  // Reset selected event snapshot
  Object.assign(selectedEventSnapshot, {
    id: '',
    title: '',
    start: '',
    end: '',
    extendedProps: {}
  });
}

// Load events on mount
onMounted(() => {
  console.log('Component mounted');
  eventStore.loadEvents();
  
  // Add a shorter delay to ensure the calendar is fully mounted
  setTimeout(forceCalendarRefresh, 200);
});
</script>

<style scoped>
.training-calendar {
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* FullCalendar custom styles - optimized */
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

:deep(.fc-daygrid-event-harness) {
  margin-bottom: 1px;
}
</style>