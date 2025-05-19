import { ref, computed } from 'vue';
import eventApi from '@/api/eventApi';

export default function useEvents() {
  const events = ref([]);
  const selectedEvent = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Fetch all events or events for a specific month
  const fetchEvents = async (year, month) => {
    loading.value = true;
    error.value = null;
    
    try {
      if (year !== undefined && month !== undefined) {
        events.value = await eventApi.getEventsByMonth(year, month);
      } else {
        events.value = await eventApi.getEvents();
      }
    } catch (err) {
      error.value = 'Failed to load events';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Fetch a single event
  const fetchEvent = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      selectedEvent.value = await eventApi.getEvent(id);
    } catch (err) {
      error.value = 'Failed to load event details';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // Create a new event
  const createEvent = async (eventData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const createdEvent = await eventApi.createEvent(eventData);
      events.value.push(createdEvent);
      return createdEvent;
    } catch (err) {
      error.value = 'Failed to create event';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update an existing event
  const updateEvent = async (id, eventData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedEvent = await eventApi.updateEvent(id, eventData);
      const index = events.value.findIndex(e => e.id === id);
      if (index !== -1) {
        events.value[index] = updatedEvent;
      }
      return updatedEvent;
    } catch (err) {
      error.value = 'Failed to update event';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete an event
  const deleteEvent = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      await eventApi.deleteEvent(id);
      events.value = events.value.filter(event => event.id !== id);
    } catch (err) {
      error.value = 'Failed to delete event';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Check if event has available spots
  const checkEventAvailability = async (id) => {
    try {
      return await eventApi.checkEventAvailability(id);
    } catch (err) {
      console.error('Failed to check availability:', err);
      return false;
    }
  };

  // Format events for calendar display
  const calendarEvents = computed(() => {
    return events.value.map(event => ({
      id: event.id,
      title: `${event.categoryId} - ${event.location} (${event.participants.length}/${event.maxParticipants})`,
      start: event.eventDate,
      end: event.eventDate,
      allDay: true,
      extendedProps: {
        category: event.categoryId,
        location: event.location,
        maxParticipants: event.maxParticipants,
        description: event.description,
        participants: event.participants
      }
    }));
  });

  return {
    events,
    selectedEvent,
    loading,
    error,
    calendarEvents,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    checkEventAvailability
  };
}