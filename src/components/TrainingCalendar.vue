<template>
  <div class="training-calendar">
    <!-- Calendar Header with navigation -->
    <CalendarHeader
      :months="MONTHS"
      :current-year="currentYear"
      :selected-month="selectedMonth"
      @update:month="selectedMonth = $event"
      @update:year="currentYear = $event"
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
import dayGridPlugin from '@fullcalendar/daygrid';import interactionPlugin from '@fullcalendar/interaction';
import roLocale from '@fullcalendar/core/locales/ro';

import { MONTHS } from '../constants/months';
import { useEventStore } from '../store/eventStore';
import CalendarHeader from './CalendarHeader.vue';
import EventModal from './EventModal.vue';
import RegistrationModal from './RegistrationModal.vue';
import ConfirmationModal from './modals/ConfirmationModal.vue';
import useCalendarEvents from '../composables/useCalendarEvents';
import useCalendarNavigation from '../composables/useCalendarNavigation';
import { markRaw } from 'vue';
import { isAdmin as checkIsAdmin } from '../utils/auth';

const fullCalendar = ref(null);
const plugins = markRaw([
  dayGridPlugin,
  interactionPlugin
]);
const {
  events, loading, error,
  loadEventsByMonth,
  loadEventsByDay,
  deleteEvent, submitEvent,
  registerForEvent
} = useCalendarEvents();

const {
  currentYear, selectedMonth, selectedDate,
  handleDatesSet,
  updateCalendarEditableOptions
} = useCalendarNavigation(fullCalendar);

const eventStore = useEventStore();
const categoriesMap = eventStore.categories;
const categories = computed(() => Object.values(categoriesMap));
const isAdmin = computed(() => checkIsAdmin());
const showEventForm = ref(false);
const showRegistrationForm = ref(false);
const showConfirmationModal = ref(false);
const isEditMode = ref(false);
const eventForm = reactive({
  id: '',
  name: '',
  category: 'CONSULTANTA',
  location: '',
  date: '',
  startTime: '09:00',
  endTime: '17:00',   maxParticipants: 10,
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
function defaultEventContentRenderer(eventInfo) {
  try {
    const category = eventInfo.event.extendedProps?.category || '';
    const location = eventInfo.event.extendedProps?.location || '';
    const participants = eventInfo.event.extendedProps?.participants || [];
    const maxParticipants = eventInfo.event.extendedProps?.maxParticipants || 0;
    const participantInfo = `${participants.length}/${maxParticipants}`;
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
    return {
      html: `<div class="fc-event-main-content"><div class="fc-event-title">${eventInfo.event.title}</div></div>`
    };
  }
}
const calendarOptions = computed(() => {
  return {
    plugins,
    initialView: 'dayGridMonth',
    locale: roLocale,
    firstDay: 1,
    headerToolbar: false,
    events,
    selectable: isAdmin.value,
    editable: isAdmin.value,
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventContent: defaultEventContentRenderer,
    datesSet: handleDatesSet,
    height: 'auto',
    displayEventEnd: false,
    dayMaxEventRows: true,
    initialDate: new Date(currentYear.value, selectedMonth.value, 1),
    views: {
      dayGridMonth: {
        dayMaxEventRows: 4
      },    }
  };
});

watch(isAdmin, (value) => {
  updateCalendarEditableOptions(fullCalendar, value);
});
watch([currentYear, selectedMonth], async ([newYear, newMonth]) => {
  console.log(`Month/year changed to ${newMonth + 1}/${newYear}`);

  await loadEventsByMonth(newYear, newMonth + 1);

});
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
      name: info.event.extendedProps?.name || info.event.title.split(' - ')[0]
    }
  };

  if (isAdmin.value) {
    showConfirmationModal.value = true;
    confirmationModalConfig.title = 'Event Options';
    confirmationModalConfig.message = 'Do you want to edit this event?';
    confirmationModalConfig.confirmButtonText = 'Edit Event';
    confirmationModalConfig.cancelButtonText = 'Delete Event';
    confirmationModalConfig.dangerous = false;
    confirmationModalConfig.showCancelButton = true;
    confirmationModalConfig.onConfirm = () => {
      showConfirmationModal.value = false;
      prepareEditEvent(eventData);
    };
    confirmationModalConfig.onCancel = () => {
      showConfirmationModal.value = false;
      confirmDeleteEvent(eventData.id);
    };
  } else {
    Object.assign(selectedEventSnapshot, eventData);
    showRegistrationForm.value = true;
  }
}
function handleDateClick(info) {
  if (!isAdmin.value) return;

  isEditMode.value = false;
  const dateOnly = info.dateStr.split('T')[0];
  selectedDate.value = dateOnly;

  let startTimeVal = '09:00';
  let endTimeVal = '17:00';

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
function prepareEditEvent(eventData) {
  isEditMode.value = true;
  const dateOnly = eventData.start;

  Object.assign(eventForm, {
    id: eventData.id,
    name: eventData.extendedProps.name || '',
    category: eventData.extendedProps.category,
    location: eventData.extendedProps.location,
    maxParticipants: eventData.extendedProps.maxParticipants,
    description: eventData.extendedProps.description,

    participants: eventData.extendedProps.participants || [],
    date: dateOnly,
    startTime: eventData.extendedProps.startTime,
    endTime: eventData.extendedProps.endTime
  });

  showEventForm.value = true;
}
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
      await loadEventsByMonth(currentYear.value, selectedMonth.value + 1);
    }
  };
  confirmationModalConfig.onCancel = () => {
    showConfirmationModal.value = false;
  };
}
async function handleEventSubmit(submittedFormData) {
  const success = await submitEvent(submittedFormData, isEditMode.value);
  if (success) {
    closeEventForm();
    await loadEventsByMonth(currentYear.value, selectedMonth.value + 1);
  }
}
async function handleRegistrationSubmit(submittedFormData) {
  const result = await registerForEvent(submittedFormData);

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
      await loadEventsByMonth(currentYear.value, selectedMonth.value + 1);
    }
  };
}
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
onMounted(async () => {
  console.log('TrainingCalendar component mounted');
  await loadEventsByMonth(currentYear.value, selectedMonth.value + 1);
  setTimeout(() => {
    try {
      if (fullCalendar.value && fullCalendar.value.getApi) {
        console.log('FullCalendar API is available');
        const api = fullCalendar.value.getApi();
        updateCalendarEditableOptions(fullCalendar, isAdmin.value);
      } else {
        console.warn('FullCalendar API not available after mounting');
      }
    } catch (error) {
      console.error('Error initializing calendar view:', error);
    }
  }, 300);
});
const refreshInterval = setInterval(async () => {
  console.log('Periodic events refresh');
  await loadEventsByMonth(currentYear.value, selectedMonth.value + 1);
}, 60000);

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