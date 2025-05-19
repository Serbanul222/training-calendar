// src/store/eventStore.js
import { reactive } from 'vue';
import eventApi from '@/api/eventApi';
import participantApi from '@/api/participantApi';
import { TRAINING_CATEGORIES } from '../constants/trainingCategories';

const eventStore = reactive({
  events: [],
  loading: false,
  error: null,

// In your eventStore.js
async loadEvents(year, month) {
  this.loading = true;
  this.error = null;

  try {
    let eventData;
    if (year !== undefined && month !== undefined) {
      console.log(`Fetching events for year: ${year}, month: ${month}`);
      eventData = await eventApi.getEventsByMonth(year, month);
    } else {
      console.log('Fetching all events');
      eventData = await eventApi.getEvents();
    }
    
    console.log('Raw event data received:', eventData);
    
    if (Array.isArray(eventData)) {
      // Format the events
      const formattedEvents = eventData.map(event => this._formatEventForCalendar(event));
      
      // Clear the array while maintaining reactivity
      this.events.length = 0;
      
      // Add all events at once (more efficient)
      this.events.push(...formattedEvents);
      
      console.log('Events after loading:', this.events.length, this.events);
    }
    
    return true;
  } catch (error) {
    console.error('Error loading events:', error);
    this.error = 'Failed to load events';
    return false;
  } finally {
    this.loading = false;
  }
},
  // Helper method to format events for FullCalendar
// In src/store/eventStore.js - update _formatEventForCalendar
_formatEventForCalendar(event) {
  console.log('Formatting event for calendar:', event);
  const category = TRAINING_CATEGORIES[event.categoryId];
  const result = {
    id: event.id,
    title: `${category?.name || event.categoryId} - ${event.location} (${event.participants?.length || 0}/${event.maxParticipants})`,
    start: event.eventDate,
    end: event.eventDate,
    allDay: true,
    backgroundColor: category?.backColor || '#f0f0f0',
    borderColor: category?.color || '#ccc',
    extendedProps: {
      category: event.categoryId,
      location: event.location,
      maxParticipants: event.maxParticipants,
      description: event.description,
      participants: event.participants || []
    },
    classNames: [event.categoryId],
    display: 'block'
  };
  console.log('Formatted event:', result);
  return result;
},

  async addEvent(eventData) {
    this.loading = true;
    this.error = null;

    try {
      const newEvent = await eventApi.createEvent({
        eventDate: eventData.eventDate || eventData.date,
        categoryId: eventData.categoryId || eventData.category,
        location: eventData.location,
        maxParticipants: eventData.maxParticipants,
        description: eventData.description
      });
      
      const formattedEvent = this._formatEventForCalendar(newEvent);
      this.events.push(formattedEvent);
      return formattedEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      this.error = 'Failed to add event';
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async updateEvent(eventData) {
    this.loading = true;
    this.error = null;

    try {
      const updatedEvent = await eventApi.updateEvent(eventData.id, {
        eventDate: eventData.eventDate || eventData.date,
        categoryId: eventData.categoryId || eventData.category,
        location: eventData.location,
        maxParticipants: eventData.maxParticipants,
        description: eventData.description
      });
      
      const formattedEvent = this._formatEventForCalendar(updatedEvent);
      const index = this.events.findIndex(event => event.id === eventData.id);
      if (index !== -1) {
        this.events[index] = formattedEvent;
      }
      return formattedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      this.error = 'Failed to update event';
      throw error;
    } finally {
      this.loading = false;
    }
  },

  // In eventStore.js
async deleteEvent(id) {
  this.loading = true;
  this.error = null;

  try {
    await eventApi.deleteEvent(id);
    
    // Find and remove the event from the local array
    const index = this.events.findIndex(event => event.id === id);
    if (index !== -1) {
      this.events.splice(index, 1); // This should trigger reactivity
      console.log('Event removed from local store');
    } else {
      console.warn('Event not found in local store');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    this.error = 'Failed to delete event';
    return false;
  } finally {
    this.loading = false;
  }
},

  // In src/store/eventStore.js - update addParticipant
async addParticipant(eventId, participant) {
  this.loading = true;
  this.error = null;

  try {
    console.log("Adding participant to event:", eventId, participant);
    const newParticipant = await participantApi.registerForEvent(eventId, participant);
    console.log("Participant added successfully:", newParticipant);
    
    // Update the event in the store
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      console.log("Found event to update:", this.events[eventIndex]);
      
      // Ensure participants array exists
      if (!this.events[eventIndex].extendedProps.participants) {
        this.events[eventIndex].extendedProps.participants = [];
      }
      
      // Add the new participant
      this.events[eventIndex].extendedProps.participants.push(newParticipant);
      
      // Update the title with new participant count
      const category = TRAINING_CATEGORIES[this.events[eventIndex].extendedProps.category];
      const participantsCount = this.events[eventIndex].extendedProps.participants.length;
      const maxParticipants = this.events[eventIndex].extendedProps.maxParticipants;
      this.events[eventIndex].title = `${category?.name || this.events[eventIndex].extendedProps.category} - ${this.events[eventIndex].extendedProps.location} (${participantsCount}/${maxParticipants})`;
      
      console.log("Updated event:", this.events[eventIndex]);
    } else {
      console.warn("Event not found in local store:", eventId);
      // Force a reload of all events to ensure consistency
      await this.loadEvents();
    }
    
    return true;
  } catch (error) {
    console.error('Error adding participant:', error);
    this.error = 'Failed to register for event';
    return false;
  } finally {
    this.loading = false;
  }
}
});

export function useEventStore() {
  return eventStore;
}