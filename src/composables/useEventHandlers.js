// src/composables/useEventHandlers.js
import { reactive, ref } from 'vue';
import { formatDateToYYYYMMDD, refreshCalendar } from '../utils/calendarUtils';

/**
 * Composable for handling event-related actions in the calendar
 * @param {Object} params - Parameters for the composable
 * @returns {Object} Event handling functions and state
 */
export default function useEventHandlers({
  isAdmin,
  fullCalendar,
  submitEvent,
  deleteEvent,
  registerForEvent,
  loadEventsByDay,
  loadEventsByMonth,
  currentYear,
  selectedMonth,
  currentView,
  TRAINING_CATEGORIES
}) {
  // Modal states
  const showEventForm = ref(false);
  const showRegistrationForm = ref(false);
  const showConfirmationModal = ref(false);
  const isEditMode = ref(false);
  const selectedDate = ref('');

  // Form data
  const eventForm = reactive({
    id: '', 
    category: 'CONSULTANTA', 
    location: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
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

  /**
   * Handle clicking on a date in the calendar
   * @param {Object} info - Click event information
   */
  function handleDateClick(info) {
  if (!isAdmin.value) return;
  
  isEditMode.value = false;
  
  // Get the clicked date and format it properly
  console.log('Calendar date click raw info:', info);
  const clickedDate = info.date instanceof Date ? info.date : new Date(info.date);
  console.log('Converted clicked date:', clickedDate);
  
  // Format the date for consistency
  const formattedDate = formatDateToYYYYMMDD(clickedDate);
  console.log('Formatted selected date for form:', formattedDate);
  
  // Set the selected date for the modal
  selectedDate.value = formattedDate;
  
  // Default time values
  let startTime = '09:00';
  let endTime = '17:00';
  
  // If clicked in timeGrid view, use that time as start time
  if (info.view.type.includes('timeGrid') && clickedDate) {
    // Round minutes to nearest 15
    const hours = clickedDate.getHours();
    const minutes = Math.floor(clickedDate.getMinutes() / 15) * 15;
    
    // Format times
    startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const endHour = (hours + 1) % 24;
    endTime = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  // Reset form data with properly formatted date
  Object.assign(eventForm, {
    id: '', 
    category: 'CONSULTANTA', 
    location: '',
    maxParticipants: 10, 
    description: '', 
    participants: [], 
    date: formattedDate, // This is the clicked date!
    startTime,
    endTime
  });
  
  console.log('Event form data after date click:', eventForm);
  
  showEventForm.value = true;
}

  /**
   * Handle clicking on an event in the calendar
   * @param {Object} info - Click event information
   */
  function handleEventClick(info) {
    // Log the raw event click info for debugging
    console.log('Event click raw info:', info);
    
    const startDate = info.event.start ? new Date(info.event.start) : new Date();
    console.log('Event start date:', startDate);
    
    // Format times properly
    const startTime = info.event.start ? 
      `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}` : 
      '09:00';
      
    let endTime;
    if (info.event.end) {
      const endDate = new Date(info.event.end);
      endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    } else {
      // Default to one hour after start if no end specified
      endTime = '17:00';
    }
    
    // Format start date for the form
    const formattedStartDate = formatDateToYYYYMMDD(startDate);
    console.log('Formatted event start date:', formattedStartDate);
    
    const eventData = {
      id: info.event.id,
      title: info.event.title,
      start: formattedStartDate,
      end: info.event.end ? formatDateToYYYYMMDD(new Date(info.event.end)) : formattedStartDate,
      extendedProps: {
        category: info.event.extendedProps?.category || '',
        location: info.event.extendedProps?.location || '',
        maxParticipants: info.event.extendedProps?.maxParticipants || 0,
        description: info.event.extendedProps?.description || '',
        participants: info.event.extendedProps?.participants ? [...info.event.extendedProps.participants] : [],
        startTime: info.event.extendedProps?.startTime || startTime,
        endTime: info.event.extendedProps?.endTime || endTime
      }
    };
    
    console.log('Prepared event data for event click:', eventData);
    
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
        prepareEditEvent(eventData);
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

  /**
   * Prepare form for editing an event
   * @param {Object} eventData - Event data
   */
  function prepareEditEvent(eventData) {
    isEditMode.value = true;
    
    console.log('Preparing edit form with event data:', eventData);
    
    // Ensure all data is properly formatted
    const formattedDate = formatDateToYYYYMMDD(eventData.start);
    console.log('Formatted date for edit form:', formattedDate);
    
    Object.assign(eventForm, {
      id: eventData.id,
      category: eventData.extendedProps.category,
      location: eventData.extendedProps.location,
      maxParticipants: eventData.extendedProps.maxParticipants,
      description: eventData.extendedProps.description,
      participants: eventData.extendedProps.participants,
      date: formattedDate,
      startTime: eventData.extendedProps.startTime,
      endTime: eventData.extendedProps.endTime
    });
    
    console.log('Edit form data prepared:', eventForm);
    
    showEventForm.value = true;
  }

  /**
   * Confirm deletion of an event
   * @param {string} eventId - Event ID
   */
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
        await reloadCalendarData();
      }
    };
    confirmationModalConfig.onCancel = () => {
      showConfirmationModal.value = false;
    };
  }

  /**
   * Handle submission of event form
   * @param {Object} formData - Form data
   */
  async function handleEventSubmit(formData) {
    try {
      console.log('Submitting event form with data:', formData);
      
      // Validate the date is present
      if (!formData.date) {
        console.error('Missing date in form submission');
        alert('Please select a valid date');
        return;
      }
      
      // Make sure formData.date is properly formatted
      const formattedDate = formatDateToYYYYMMDD(formData.date);
      console.log('Formatted date for submission:', formattedDate);
      formData.date = formattedDate;
      
      // Validate times
      if (formData.startTime >= formData.endTime) {
        console.error('Invalid time range in form submission');
        alert('End time must be after start time');
        return;
      }
      
      const success = await submitEvent(formData, isEditMode.value);
      if (success) {
        closeEventForm();
        await reloadCalendarData();
      }
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  }

  /**
   * Handle submission of registration form
   * @param {Object} formData - Form data
   */
  async function handleRegistrationSubmit(formData) {
    console.log('Submitting registration form with data:', formData);
    
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
        await reloadCalendarData();
      }
    };
  }

  /**
   * Reload calendar data based on current view
   */
  async function reloadCalendarData() {
    console.log('Reloading calendar data for view:', currentView.value);
    
    if (currentView.value.includes('timeGrid')) {
      const calendarDate = fullCalendar.value?.getApi().getDate() || new Date();
      console.log('Current calendar date:', calendarDate);
      const formattedDate = formatDateToYYYYMMDD(calendarDate);
      console.log('Formatted calendar date for reload:', formattedDate);
      await loadEventsByDay(formattedDate);
    } else {
      console.log('Loading month view data for year:', currentYear.value, 'month:', selectedMonth.value + 1);
      await loadEventsByMonth(currentYear.value, selectedMonth.value + 1);
    }
    
    // Force calendar to refresh
    refreshCalendar(fullCalendar);
  }

  /**
   * Close event form modal
   */
  function closeEventForm() {
    console.log('Closing event form modal');
    showEventForm.value = false;
    
    // Reset form data to defaults
    Object.assign(eventForm, { 
      id: '', 
      category: 'CONSULTANTA', 
      location: '', 
      maxParticipants: 10, 
      description: '', 
      participants: [], 
      date: '',
      startTime: '09:00',
      endTime: '17:00'
    });
    
    console.log('Event form reset to defaults');
  }

  /**
   * Close registration form modal
   */
  function closeRegistrationForm() {
    console.log('Closing registration form modal');
    showRegistrationForm.value = false;
    
    // Reset event snapshot
    Object.assign(selectedEventSnapshot, { 
      id: '', 
      title: '', 
      start: '', 
      end: '', 
      extendedProps: {} 
    });
    
    console.log('Event snapshot reset');
  }

  // Debug helper for dates
  function logDateInfo(label, dateValue) {
    console.log(`${label}:`, {
      raw: dateValue,
      type: typeof dateValue,
      isDate: dateValue instanceof Date,
      formatted: dateValue instanceof Date ? formatDateToYYYYMMDD(dateValue) : 
               (typeof dateValue === 'string' ? dateValue : 'N/A'),
      timestamp: dateValue instanceof Date ? dateValue.getTime() : 'N/A'
    });
  }

  return {
    showEventForm,
    showRegistrationForm,
    showConfirmationModal,
    isEditMode,
    selectedDate,
    eventForm,
    selectedEventSnapshot,
    confirmationModalConfig,
    handleDateClick,
    handleEventClick,
    prepareEditEvent,
    confirmDeleteEvent,
    handleEventSubmit,
    handleRegistrationSubmit,
    closeEventForm,
    closeRegistrationForm,
    reloadCalendarData
  };
}