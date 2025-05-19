import { reactive } from 'vue';
import eventApi from '@/api/eventApi';
import { TRAINING_CATEGORIES } from '../constants/trainingCategories';

const eventStore = reactive({
  events: [],
  loading: false,
  error: null,

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
        // Create a single batch update for reactivity
        const formattedEvents = eventData.map(event => this._formatEventForCalendar(event));
        
        // Clear and update in a single batch
        this.events.length = 0;
        formattedEvents.forEach(event => this.events.push(event));
        
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

  // New method to load events for a specific day
  async loadEventsByDay(date) {
    this.loading = true;
    this.error = null;

    try {
      console.log(`Fetching events for day: ${date}`);
      const eventData = await eventApi.getEventsByDay(date);
      
      console.log('Raw day event data received:', eventData);
      
      // Format for calendar and store
      if (Array.isArray(eventData)) {
        const formattedEvents = eventData.map(event => this._formatEventForCalendar(event));
        
        // Return the events without modifying the main events array
        return formattedEvents;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading day events:', error);
      this.error = 'Failed to load events for the day';
      return [];
    } finally {
      this.loading = false;
    }
  },

  async addEvent(eventData) {
    this.loading = true;
    this.error = null;

    try {
      // Ensure data is in the format expected by the backend
      const eventRequest = {
        eventDate: eventData.eventDate || eventData.date,
        startTime: eventData.startTime || '09:00',
        endTime: eventData.endTime || '17:00',
        categoryId: eventData.categoryId || eventData.category,
        location: eventData.location,
        maxParticipants: eventData.maxParticipants,
        description: eventData.description
      };
      
      console.log('Creating event:', eventRequest);
      const newEvent = await eventApi.createEvent(eventRequest);
      
      const formattedEvent = this._formatEventForCalendar(newEvent);
      this.events.push(formattedEvent);
      
      return formattedEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      this.error = 'Failed to add event';
      if (error.response?.status === 409) {
        this.error = 'Time conflict with existing event';
      }
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async updateEvent(eventData) {
    this.loading = true;
    this.error = null;

    try {
      // Ensure data is in the format expected by the backend
      const eventRequest = {
        eventDate: eventData.eventDate || eventData.date,
        startTime: eventData.startTime || '09:00',
        endTime: eventData.endTime || '17:00',
        categoryId: eventData.categoryId || eventData.category,
        location: eventData.location,
        maxParticipants: eventData.maxParticipants,
        description: eventData.description
      };
      
      console.log('Updating event:', eventData.id, eventRequest);
      const updatedEvent = await eventApi.updateEvent(eventData.id, eventRequest);
      
      const formattedEvent = this._formatEventForCalendar(updatedEvent);
      const index = this.events.findIndex(event => event.id === eventData.id);
      if (index !== -1) {
        this.events[index] = formattedEvent;
      }
      
      return formattedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      this.error = 'Failed to update event';
      if (error.response?.status === 409) {
        this.error = 'Time conflict with existing event';
      }
      throw error;
    } finally {
      this.loading = false;
    }
  },

  async deleteEvent(id) {
    this.loading = true;
    this.error = null;

    try {
      await eventApi.deleteEvent(id);
      this.events = this.events.filter(event => event.id !== id);
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      this.error = 'Failed to delete event';
      return false;
    } finally {
      this.loading = false;
    }
  },

  async checkTimeConflict(date, startTime, endTime, excludeEventId = null) {
    try {
      return await eventApi.checkTimeConflict(date, startTime, endTime, excludeEventId);
    } catch (error) {
      console.error('Error checking time conflict:', error);
      return false;
    }
  },

  async addParticipant(eventId, participant) {
    this.loading = true;
    this.error = null;

    try {
      const newParticipant = await participantApi.registerForEvent(eventId, participant);
      
      // Update the event in the store
      const eventIndex = this.events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        if (!this.events[eventIndex].extendedProps.participants) {
          this.events[eventIndex].extendedProps.participants = [];
        }
        this.events[eventIndex].extendedProps.participants.push(newParticipant);
        
        // Update title and other properties
        this._updateEventDisplayProperties(eventIndex);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding participant:', error);
      this.error = 'Failed to register for event';
      return false;
    } finally {
      this.loading = false;
    }
  },

  // Helper method to update event display properties
  _updateEventDisplayProperties(eventIndex) {
    if (eventIndex < 0 || eventIndex >= this.events.length) return;
    
    const event = this.events[eventIndex];
    const category = TRAINING_CATEGORIES[event.extendedProps.category];
    const participantsCount = event.extendedProps.participants.length;
    const maxParticipants = event.extendedProps.maxParticipants;
    
    // Update title to include time
    const timeDisplay = `${event.extendedProps.startTime} - ${event.extendedProps.endTime}`;
    event.title = `${category?.name || event.extendedProps.category} - ${event.extendedProps.location} (${timeDisplay}, ${participantsCount}/${maxParticipants})`;
    
    // Update availability properties
    event.extendedProps.availableSpots = maxParticipants - participantsCount;
    event.extendedProps.isFull = participantsCount >= maxParticipants;
  },

  // Helper method to format events for FullCalendar
  _formatEventForCalendar(event) {
  console.log('Formatting event for calendar:', event);
  const category = TRAINING_CATEGORIES[event.categoryId];
  
  // Format the start and end times for FullCalendar
  const startDateTime = `${event.eventDate}T${event.startTime}:00`;
  const endDateTime = `${event.eventDate}T${event.endTime}:00`;
  
  // Create the calendar event format
  const calendarEvent = {
    id: event.id,
    title: `${category?.name || event.categoryId} - ${event.location}`,
    start: startDateTime,
    end: endDateTime,
    allDay: false, // Important: set to false for time-based events
    backgroundColor: category?.backColor || '#f0f0f0',
    borderColor: category?.color || '#ccc',
    extendedProps: {
      category: event.categoryId,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      maxParticipants: event.maxParticipants,
      description: event.description,
      participants: event.participants || [],
      availableSpots: event.availableSpots,
      isFull: event.isFull
    },
    classNames: [event.categoryId],
    display: 'block'
  };
    
    // Update title to include time
    const timeDisplay = `${event.startTime} - ${event.endTime}`;
    const participantCount = event.participants ? event.participants.length : 0;
    calendarEvent.title = `${category?.name || event.categoryId} - ${event.location} (${participantCount}/${event.maxParticipants})`;
    calendarEvent.title = `${category?.name || event.categoryId} - ${event.location} (${timeDisplay}, ${event.participants.length}/${event.maxParticipants})`;
    console.log('Formatted event:', calendarEvent);
    return calendarEvent;
  }
  
});

export function useEventStore() {
  return eventStore;
}