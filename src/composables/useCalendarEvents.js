// src/composables/useCalendarEvents.js

import { ref, reactive } from 'vue';
import { useEventStore } from '../store/eventStore';

/**
 * Composable for handling calendar events and their operations
 * @returns {Object} Event operations and state
 */
export default function useCalendarEvents() {
  // State
  const events = reactive([]);
  const loading = ref(false);
  const error = ref('');
  
  // Get event store
  const eventStore = useEventStore();
  const checkTimeConflict = eventStore.checkTimeConflict;

  
  // Load events for a specific month and year
  const loadEventsByMonth = async (year, month) => {
    loading.value = true;
    error.value = '';
    
    try {
      console.log(`Loading events for year: ${year}, month: ${month}`);
      const success = await eventStore.loadEvents(year, month);
      console.log(`Events loaded successfully: ${success}`);
      
      // Copy events from store to local reactive state
      const storeEvents = eventStore.events;
      console.log(`Current events in store: ${storeEvents.length}`);
      console.log(storeEvents);
      
      // Clear events array and add new events
      events.length = 0;
      storeEvents.forEach(event => events.push(event));
      
      return success;
    } catch (err) {
      console.error('Error loading events:', err);
      error.value = 'Failed to load events: ' + err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Load events for a specific day
  const loadEventsByDay = async (date) => {
    loading.value = true;
    error.value = '';
    
    try {
      console.log(`Loading events for date: ${date}`);
      const success = await eventStore.loadEventsByDay(date);
      
      // Copy events from store to local reactive state
      const storeEvents = eventStore.events;
      
      // Clear events array and add new events
      events.length = 0;
      storeEvents.forEach(event => events.push(event));
      
      return success;
    } catch (err) {
      console.error('Error loading events:', err);
      error.value = 'Failed to load events: ' + err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Delete an event
  const deleteEvent = async (eventId) => {
    loading.value = true;
    error.value = '';
    
    try {
      const success = await eventStore.deleteEvent(eventId);
      if (success) {
        // Remove from local events array
        const index = events.findIndex(e => e.id === eventId);
        if (index !== -1) {
          events.splice(index, 1);
        }
      }
      return success;
    } catch (err) {
      console.error('Error deleting event:', err);
      error.value = 'Failed to delete event: ' + err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Submit event (create or update)
  const submitEvent = async (formData, isEditMode) => {
    loading.value = true;
    error.value = '';
    
    try {
      let result;
      
      if (isEditMode) {
        result = await eventStore.updateEvent(formData);
      } else {
        result = await eventStore.addEvent(formData);
      }
      
      if (result) {
        // Make sure the successful result is in our events array
        if (isEditMode) {
          // Update existing event
          const index = events.findIndex(e => e.id === formData.id);
          if (index !== -1) {
            events[index] = result;
          }
        } else {
          // Add new event
          events.push(result);
        }
      }
      
      return !!result;
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, err);
      error.value = `Failed to ${isEditMode ? 'update' : 'create'} event: ` + err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  // Register for an event
  const registerForEvent = async (formData) => {
    loading.value = true;
    error.value = '';
    
    try {
      // Create participant object
      const participant = {
        id: Date.now().toString(),
        participantEmail: formData.participantEmail,
        participantName: formData.participantName || formData.participantEmail.split('@')[0],
        managerEmail: formData.managerEmail,
        location: formData.location
      };
      
      const eventId = formData.eventId;
      
      // Find the event to check its capacity
      const event = events.find(e => e.id === eventId);
      if (!event) {
        return {
          success: false,
          message: 'Event not found'
        };
      }
      
      // Check if event is full
      const participants = event.extendedProps?.participants || [];
      const maxParticipants = event.extendedProps?.maxParticipants || 0;
      
      if (participants.length >= maxParticipants) {
        return {
          success: false,
          message: 'This event is already full. Please select another event.'
        };
      }
      
      // Add participant
      const success = await eventStore.addParticipant(eventId, participant);
      
      if (success) {
        // Update the local event object
        const updatedEvent = eventStore.events.find(e => e.id === eventId);
        if (updatedEvent) {
          const index = events.findIndex(e => e.id === eventId);
          if (index !== -1) {
            events[index] = updatedEvent;
          }
        }
        
        return {
          success: true,
          message: 'Registration successful! You are now registered for this event.'
        };
      } else {
        return {
          success: false,
          message: 'Registration failed. The event might be full or an error occurred.'
        };
      }
    } catch (err) {
      console.error('Error registering for event:', err);
      error.value = 'Failed to register for event: ' + err.message;
      
      return {
        success: false,
        message: 'An error occurred during registration: ' + err.message
      };
    } finally {
      loading.value = false;
    }
  };
  
  return {
    events,
    loading,
    error,
    loadEventsByMonth,
    loadEventsByDay,
    deleteEvent,
    submitEvent,
    registerForEvent,
    checkTimeConflict 
  };
}