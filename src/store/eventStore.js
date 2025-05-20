import { reactive } from 'vue';
import eventApi from '@/api/eventApi';
import categoryApi from '@/api/categoryApi';
import participantApi from '@/api/participantApi'; // Added back for participant registration
import { TRAINING_CATEGORIES } from '../constants/trainingCategories';

const eventStore = reactive({
  events: [],
  categories: {}, // Stores categories fetched from API or fallback
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
        const formattedEvents = eventData.map(event => this._formatEventForCalendar(event));
        this.events.length = 0;
        formattedEvents.forEach(event => this.events.push(event));
        console.log('Events after loading:', this.events.length);
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

  async loadEventsByDay(date) {
    this.loading = true;
    this.error = null;
    try {
      console.log(`Fetching events for day: ${date}`);
      const eventData = await eventApi.getEventsByDay(date);
      console.log('Raw day event data received:', eventData);
      if (Array.isArray(eventData)) {
        return eventData.map(event => this._formatEventForCalendar(event));
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
      const eventRequest = {
        name: eventData.name,
        eventDate: (eventData.eventDate || eventData.date)?.split('T')[0],
        startTime: eventData.startTime || '09:00',
        endTime: eventData.endTime || '17:00',
        categoryId: eventData.categoryId || eventData.category,
        location: eventData.location,
        maxParticipants: Number(eventData.maxParticipants) || 0,
        description: eventData.description
      };
      console.log('Creating event:', eventRequest);
      const newEvent = await eventApi.createEvent(eventRequest);
      const formattedEvent = this._formatEventForCalendar(newEvent);
      this.events.push(formattedEvent);
      return formattedEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      this.error = error.response?.data?.message || 'Failed to add event';
      if (error.response?.status === 409) {
        this.error = 'Time conflict with existing event.';
      }
      throw error; // Re-throw to be handled by the caller if needed
    } finally {
      this.loading = false;
    }
  },

  async updateEvent(eventData) {
    this.loading = true;
    this.error = null;
    try {
      const eventRequest = {
        name: eventData.name,
        eventDate: (eventData.eventDate || eventData.date)?.split('T')[0],
        startTime: eventData.startTime || '09:00',
        endTime: eventData.endTime || '17:00',
        categoryId: eventData.categoryId || eventData.category,
        location: eventData.location,
        maxParticipants: Number(eventData.maxParticipants) || 0,
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
      this.error = error.response?.data?.message || 'Failed to update event';
      if (error.response?.status === 409) {
        this.error = 'Time conflict with existing event.';
      }
      throw error; // Re-throw
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
      return false; // Or throw error for more specific handling by caller
    }
  },

  async addParticipant(eventId, participantData) {
    this.loading = true;
    this.error = null;
    try {
      const newParticipant = await participantApi.registerForEvent(eventId, participantData);
      if (!newParticipant) {
        throw new Error("Participant registration did not return participant data.");
      }

      const eventIndex = this.events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        const eventToUpdate = this.events[eventIndex];
        if (!eventToUpdate.extendedProps.participants) {
          eventToUpdate.extendedProps.participants = [];
        }
        eventToUpdate.extendedProps.participants.push(newParticipant);

        // To ensure all displayed properties are updated consistently,
        // re-format the event using the original data plus the new participant list.
        // This re-uses _formatEventForCalendar as the single source of truth for display.
        const rawEventDataForReformat = {
            id: eventToUpdate.id,
            name: eventToUpdate.extendedProps.name,
            eventDate: eventToUpdate.start.split('T')[0], // Extract date from current start time
            startTime: eventToUpdate.extendedProps.startTime,
            endTime: eventToUpdate.extendedProps.endTime,
            categoryId: eventToUpdate.extendedProps.category,
            location: eventToUpdate.extendedProps.location,
            maxParticipants: eventToUpdate.extendedProps.maxParticipants,
            description: eventToUpdate.extendedProps.description,
            participants: eventToUpdate.extendedProps.participants, // Already updated
        };
        this.events[eventIndex] = this._formatEventForCalendar(rawEventDataForReformat);

      } else {
        console.warn(`Event with id ${eventId} not found in local store after adding participant.`);
        // Optionally, reload all events or the specific event if necessary
      }
      return true;
    } catch (error) {
      console.error('Error adding participant:', error);
      this.error = error.response?.data?.message || 'Failed to register for event';
      return false;
    } finally {
      this.loading = false;
    }
  },

  // _updateEventDisplayProperties is effectively replaced by re-calling _formatEventForCalendar
  // after participant changes to ensure full consistency.
  // If you still need it for very specific, targeted updates without full re-format,
  // ensure its logic is harmonized with _formatEventForCalendar.
  /*
  _updateEventDisplayProperties(eventIndex) {
    // ... (implementation would need to be consistent with _formatEventForCalendar)
  },
  */

  _formatEventForCalendar(event) {
    console.log('Formatting event for calendar (raw input):', event);

    // Use API-fetched categories first, then fallback to static constants
    const categoryInfo = this.categories[event.categoryId] || TRAINING_CATEGORIES[event.categoryId];

    const normalizeTime = (timeStr) => {
      if (timeStr === null || typeof timeStr === 'undefined') return '00:00:00'; // Default for missing time
      const sTime = String(timeStr);
      return sTime.length === 5 ? `${sTime}:00` : sTime; // Append :00 if HH:mm
    };

    const eventDate = event.eventDate || (event.start ? event.start.split('T')[0] : new Date().toISOString().split('T')[0]);
    const startTime = event.startTime || '00:00'; // Default start time
    const endTime = event.endTime || '00:00';   // Default end time

    const startDateTime = `${eventDate}T${normalizeTime(startTime)}`;
    const endDateTime = `${eventDate}T${normalizeTime(endTime)}`;

    const participantsArray = Array.isArray(event.participants) ? event.participants : [];
    const participantCount = participantsArray.length;
    const maxP = Number(event.maxParticipants) || 0;

    const baseName = event.name || categoryInfo?.name || event.categoryId || 'Unnamed Event';
    const location = event.location || 'No Location';

    // Consistent title format
    const timeDisplayInTitle = `${startTime} - ${endTime}`;
    const fullTitle = `${baseName} - ${location} (${timeDisplayInTitle}, ${participantCount}/${maxP})`;

    const calendarEvent = {
      id: event.id,
      title: fullTitle,
      start: startDateTime,
      end: endDateTime,
      allDay: false,
      backgroundColor: categoryInfo?.backColor || '#f0f0f0',
      borderColor: categoryInfo?.color || '#ccc',
      extendedProps: {
        category: event.categoryId,
        name: event.name, // Store original name from API
        location: event.location,
        startTime: startTime, // Store original/defaulted start time
        endTime: endTime,     // Store original/defaulted end time
        maxParticipants: maxP,
        description: event.description,
        participants: participantsArray, // Store the actual participants array
        availableSpots: maxP - participantCount,
        isFull: maxP > 0 && participantCount >= maxP,
      },
      classNames: event.categoryId ? [String(event.categoryId)] : [], // Ensure classNames are strings
      display: 'block'
    };

    console.log('Formatted event (output):', calendarEvent);
    return calendarEvent;
  },

  async fetchCategories() {
    this.loading = true; // Indicate loading for categories as well
    try {
      const data = await categoryApi.getCategories();
      this.categories = data.reduce((map, c) => {
        map[c.id] = { ...c }; // Spread to ensure reactivity if c itself is a proxy
        return map;
      }, {});
      console.log('Categories loaded from API:', this.categories);
    } catch (err) {
      console.error('Error loading categories from API, falling back to constants:', err);
      this.categories = Object.keys(TRAINING_CATEGORIES).reduce((map, key) => {
        map[key] = { ...TRAINING_CATEGORIES[key], id: key };
        return map;
      }, {});
      console.log('Fallback categories:', this.categories);
      this.error = "Failed to load categories."; // Set error for categories
    } finally {
      this.loading = false;
    }
  }
});

// Initialize categories when the store is created
eventStore.fetchCategories();

export function useEventStore() {
  return eventStore;
}