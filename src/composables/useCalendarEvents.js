// src/composables/useCalendarEvents.js
import { ref } from 'vue';
import { useEventStore } from '../store/eventStore';

export default function useCalendarEvents() {
  const eventStore = useEventStore();
  const loading = ref(false);
  const error = ref(null);
  
  // Load events for a specific month and year
 async function loadEventsByMonth(year, month) {
  loading.value = true;
  error.value = null;
  
  try {
    console.log(`Loading events for year: ${year}, month: ${month + 1}`);
    const success = await eventStore.loadEvents(year, month + 1);
    console.log("Events loaded successfully:", success);
    console.log("Current events in store:", eventStore.events.length, eventStore.events);
    return success;
  } catch (err) {
    error.value = 'Failed to load events. Please try again.';
    console.error('Error loading events:', err);
    return false;
  } finally {
    loading.value = false;
  }
}

  // Delete an event
 // In useCalendarEvents.js
async function deleteEvent(eventId) {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Deleting event ID:', eventId);
    const success = await eventStore.deleteEvent(eventId);
    
    if (success) {
      console.log('Event successfully deleted from API');
      // Force a calendar refresh here
      return true;
    } else {
      error.value = 'Failed to delete event';
      console.error('Failed to delete event');
      return false;
    }
  } catch (err) {
    error.value = 'Failed to delete event';
    console.error('Error deleting event:', err);
    return false;
  } finally {
    loading.value = false;
  }
}

  // Event form submission handling
  async function submitEvent(formData, isEditMode) {
    loading.value = true;
    error.value = null;
    
    try {
      // Convert from frontend to backend field names
      const eventData = {
        id: formData.id,
        eventDate: formData.date, // Convert 'date' to 'eventDate'
        categoryId: formData.category, // Convert 'category' to 'categoryId'
        location: formData.location,
        maxParticipants: formData.maxParticipants,
        description: formData.description,
        participants: formData.participants || []
      };
      
      let result;
      if (isEditMode) {
        // Update existing event
        result = await eventStore.updateEvent(eventData);
      } else {
        // Create new event
        result = await eventStore.addEvent(eventData);
      }
      
      if (result) {
        console.log('Event saved successfully');
        return true;
      } else {
        error.value = 'Failed to save event';
        console.error('Failed to save event');
        return false;
      }
    } catch (err) {
      error.value = 'Failed to save event';
      console.error('Error saving event:', err);
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Registration form submission handling
  async function registerForEvent(formData) {
    loading.value = true;
    error.value = null;
    
    try {
      // Create a participant request object for the API
      const participantRequest = {
        participantEmail: formData.participantEmail,
        participantName: formData.participantName,
        managerEmail: formData.managerEmail,
        location: formData.location
      };
      
      const success = await eventStore.addParticipant(formData.eventId, participantRequest);
      
      if (success) {
        return { success: true, message: 'Registration successful!' };
      } else {
        error.value = 'Registration failed. The event might be full.';
        return { success: false, message: 'Registration failed. The event might be full.' };
      }
    } catch (err) {
      error.value = 'Registration failed';
      console.error('Error during registration:', err);
      return { success: false, message: 'Registration failed. Please try again.' };
    } finally {
      loading.value = false;
    }
  }

  return {
    events: eventStore.events,
    loading,
    error,
    loadEventsByMonth,
    deleteEvent,
    submitEvent,
    registerForEvent
  };
}