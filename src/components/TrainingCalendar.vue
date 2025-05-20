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

    <!-- View Type Selector -->
    <CalendarViewSwitcher
      :current-view="currentView"
      @update:view="setView"
    />


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
      :categories="categories"
      :event-date="selectedDate"
      @submit="handleEventSubmit"
      @close="closeEventForm"
    />

    <!-- Registration modal for registering for events -->
    <RegistrationModal
      v-if="showRegistrationForm"
      :show="showRegistrationForm"
      :event="selectedEventSnapshot"
      :categories="categoriesMap"
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
import timeGridPlugin from '@fullcalendar/timegrid'; // Import time grid plugin
import interactionPlugin from '@fullcalendar/interaction';
import roLocale from '@fullcalendar/core/locales/ro';

import { MONTHS } from '../constants/months';
import { useEventStore } from '../store/eventStore';

// Import components
import CalendarHeader from './CalendarHeader.vue';
import EventModal from './EventModal.vue';
import RegistrationModal from './RegistrationModal.vue';
import ConfirmationModal from './modals/ConfirmationModal.vue';
import CalendarViewSwitcher from './CalendarViewSwitcher.vue';

// Import composables and utils
import useCalendarEvents from '../composables/useCalendarEvents';
import useCalendarNavigation from '../composables/useCalendarNavigation';
import { markRaw } from 'vue';

// Setup calendar and plugins
const fullCalendar = ref(null);
// Make sure to import and register all required plugins
const plugins = markRaw([
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin
]);
const currentView = ref('dayGridMonth'); // Default view is month

// Setup composables
const {
  events, loading, error,
  loadEventsByMonth, // Assuming loadEventsByMonth is updated by the fix branch if month indexing changed
  loadEventsByDay,   // This was from the other branch, ensure it's available if used by the fix branch
  deleteEvent, submitEvent,
  registerForEvent
} = useCalendarEvents();

const {
  currentYear, selectedMonth, selectedDate,
  handleDatesSet, forceCalendarRefresh,
  updateCalendarEditableOptions
} = useCalendarNavigation(fullCalendar);

const eventStore = useEventStore();
const categoriesMap = eventStore.categories;
const categories = computed(() => Object.values(categoriesMap));

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
  name: '',
  category: 'CONSULTANTA',
  location: '',
  date: '',
  startTime: '09:00', // Default start time
  endTime: '17:00',   // Default end time
  maxParticipants: 10,
  description: '',
  participants: []
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

// Define the event content renderer
function defaultEventContentRenderer(eventInfo) {
  try {
    const category = eventInfo.event.extendedProps?.category || '';
    const location = eventInfo.event.extendedProps?.location || '';
    const participants = eventInfo.event.extendedProps?.participants || [];
    const maxParticipants = eventInfo.event.extendedProps?.maxParticipants || 0;

    // Create participant info text
    const participantInfo = `${participants.length}/${maxParticipants}`;

    // Build HTML for the event, with appropriate classes for the category
    return {
      html: `
        <div class="fc-event-main-content ${category}">
          <div class="fc-event-title">${eventInfo.event.title}</div>
          <div class="fc-event-location">${location}</div>
          <div class="fc-event-participants">${participantInfo}</div>
        </div>
      `
    };
  } catch (error) {
    console.error('Error rendering event content:', error);
    // Fallback rendering
    return {
      html: `<div class="fc-event-main-content"><div class="fc-event-title">${eventInfo.event.title}</div></div>`
    };
  }
}

// Calendar options
const calendarOptions = computed(() => {
  // Start with a clean options object
  return {
    plugins,
    initialView: 'dayGridMonth', // Always start with month view for stability
    locale: roLocale,
    firstDay: 1, // Monday
    headerToolbar: false, // We'll create our own header
    events,
    selectable: isAdmin.value,
    editable: isAdmin.value,
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventContent: defaultEventContentRenderer,
    datesSet: handleDatesSet,
    height: 'auto', // Dynamically adjust height based on content
    displayEventEnd: false, // Since all events are all-day by default
    dayMaxEventRows: true, // Better performance for event display
    initialDate: new Date(currentYear.value, selectedMonth.value, 1),

    // Time grid specific options
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    allDaySlot: true,

    // Configure each view specifically
    views: {
      dayGridMonth: {
        // Month view configuration
        dayMaxEventRows: 4
      },
      timeGridWeek: {
        // Week view configuration
        slotLabelFormat: {
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
          hour12: false
        }
      },
      /* timeGridDay view removed */
    }
  };
});

// Set the calendar view type
function setView(viewType) {
  // Update the view state
  currentView.value = viewType;

  // Safely access the calendar API with proper error handling
  try {
    if (fullCalendar.value && fullCalendar.value.getApi) {
      // Get the API
      const api = fullCalendar.value.getApi();

      // Make sure the view type exists and is properly registered
      const availableViews = ['dayGridMonth', 'timeGridWeek'];

      if (availableViews.includes(viewType)) {
        console.log(`Changing view to: ${viewType}`);
        // Use a timeout to ensure the view change happens after the current rendering cycle
        setTimeout(() => {
          api.changeView(viewType);
          console.log(`View successfully changed to: ${viewType}`);
        }, 0);
      } else {
        console.warn(`Invalid view type: ${viewType}`);
      }
    } else {
      console.warn('FullCalendar component not fully mounted yet');
    }
  } catch (error) {
    console.error('Error changing calendar view:', error);
  }
}

// Watch for view changes to load appropriate data
watch(currentView, async () => {
  await loadEventsByMonth(currentYear.value, selectedMonth.value);
  forceCalendarRefresh();
});

// Watch month/year changes
watch([currentYear, selectedMonth], async ([newYear, newMonth]) => {
  console.log(`Month/year changed to ${newMonth+1}/${newYear}`); // Note: newMonth is 0-indexed here
  if (currentView.value === 'dayGridMonth') {
    // Assuming loadEventsByMonth expects 1-indexed month, consistent with onMounted
    await loadEventsByMonth(newYear, newMonth + 1);
  }
  // If other views need different logic for month/year changes, add it here.
  // The `fligbc-codex` version of `watch(currentView, ...)` only calls loadEventsByMonth,
  // so we need to ensure data reloads appropriately for all scenarios.
  // The current structure implies that if the view is NOT dayGridMonth,
  // the `watch(currentView, ...)` handles the reload.
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
  const startTime = info.event.start ? new Date(info.event.start).toTimeString().substring(0, 5) : '09:00';
  const endTime = info.event.end ? new Date(info.event.end).toTimeString().substring(0, 5) : '17:00';

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
      participants: info.event.extendedProps?.participants ? [...info.event.extendedProps.participants] : [],
      startTime: info.event.extendedProps?.startTime || startTime,
      endTime: info.event.extendedProps?.endTime || endTime,
      name: info.event.extendedProps?.name || info.event.title.split(' - ')[0] // Attempt to get name
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
      prepareEditEvent(eventData, info); // Pass full eventData
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
  const dateOnly = info.dateStr.split('T')[0];
  selectedDate.value = dateOnly;

  // Get time information if available
  let startTimeVal = '09:00';
  let endTimeVal = '17:00';

  if (info.view.type.includes('timeGrid') && info.date) {
    // If clicked in timeGrid view, use that time as start time
    const clickedDate = new Date(info.date);
    const hours = clickedDate.getHours().toString().padStart(2, '0');
    // Snap to 15-minute intervals for start time
    const minutes = (Math.floor(clickedDate.getMinutes() / 15) * 15).toString().padStart(2, '0');
    startTimeVal = `${hours}:${minutes}`;

    // Calculate end time 1 hour later
    const endDate = new Date(clickedDate.getTime() + 60 * 60 * 1000); // Add 1 hour
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = (Math.floor(endDate.getMinutes() / 15) * 15).toString().padStart(2, '0');
    endTimeVal = `${endHours}:${endMinutes}`;
  }

  Object.assign(eventForm, {
    id: '',
    name: '',
    category: 'CONSULTANTA',
    location: '',
    maxParticipants: 10,
    description: '',
    participants: [],
    date: dateOnly,
    startTime: startTimeVal,
    endTime: endTimeVal
  });

  showEventForm.value = true;
}

// Prepare edit event
function prepareEditEvent(eventData) { // Removed 'info' as it's not used here
  isEditMode.value = true;

  const dateOnly = eventData.start.split('T')[0];

  Object.assign(eventForm, {
    id: eventData.id,
    name: eventData.extendedProps.name, // This was duplicated in original, kept one.
    category: eventData.extendedProps.category,
    location: eventData.extendedProps.location,
    maxParticipants: eventData.extendedProps.maxParticipants,
    description: eventData.extendedProps.description,
    participants: eventData.extendedProps.participants ? [...eventData.extendedProps.participants] : [],
    date: dateOnly,
    startTime: eventData.extendedProps.startTime,
    endTime: eventData.extendedProps.endTime
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
      // Reload appropriate data based on current view
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

    // Reload appropriate data based on current view
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

      // Reload appropriate data based on current view
      await loadEventsByMonth(currentYear.value, selectedMonth.value);
    }
  };
}

// Close modals
function closeEventForm() {
  showEventForm.value = false;
  Object.assign(eventForm, {
    id: '',
    name: '',
    category: 'CONSULTANTA',
    location: '',
    maxParticipants: 10,
    description: '',
    participants: [],
    date: '',
    startTime: '09:00',
    endTime: '17:00'
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

  // Load initial events, selectedMonth is 0-indexed, loadEventsByMonth might expect 1-indexed
  await loadEventsByMonth(currentYear.value, selectedMonth.value + 1);

  // Wait a short time to ensure FullCalendar is fully rendered
  setTimeout(() => {
    try {
      if (fullCalendar.value && fullCalendar.value.getApi) {
        console.log('FullCalendar API is available');

        // Initialize with the current view if needed
        const api = fullCalendar.value.getApi();

        // Set the initial view after component has fully mounted
        // Makes sure view-specific plugins are properly loaded
        api.changeView(currentView.value);

        console.log(`Calendar view initialized to: ${currentView.value}`);
      } else {
        console.warn('FullCalendar API not available after mounting');
      }
    } catch (error) {
      console.error('Error initializing calendar view:', error);
    }
  }, 300); // Increased delay to ensure full initialization
});

// Set up auto-refresh interval with less frequent updates
const refreshInterval = setInterval(async () => {
  console.log('Periodic events refresh');

  // Reload appropriate data based on current view
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

:deep(.fc-event-time) {
  font-size: 0.85em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.fc-timegrid-event .fc-event-main) {
  padding: 2px 4px;
}

:deep(.fc-timegrid-slots tr) {
  line-height: 1.75; /* Makes the time slots a bit taller */
}

:deep(.fc-timegrid-slot-label) {
  font-size: 0.85em;
}

:deep(.fc-col-header-cell) {
  font-weight: bold;
}

/* Category colors in time grid */
:deep(.CONSULTANTA) {
  border-left: 4px solid #4a86e8 !important;
}

:deep(.OPTOMETRIE) {
  border-left: 4px solid #9900ff !important;
}

:deep(.PRODUSE_HOYA) {
  border-left: 4px solid #f1c232 !important;
}
</style>