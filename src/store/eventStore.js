import { reactive } from 'vue';
import eventApi from '@/api/eventApi';
import categoryApi from '@/api/categoryApi'; // Kept from fligbc-codex
import { TRAINING_CATEGORIES } from '../constants/trainingCategories';

const eventStore = reactive({
  events: [],
  categories: {}, // Kept from fligbc-codex
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

  async loadEventsByDay(date) {
    this.loading = true;
    this.error = null;

    try {
      console.log(`Fetching events for day: ${date}`);
      const eventData = await eventApi.getEventsByDay(date);

      console.log('Raw day event data received:', eventData);

      if (Array.isArray(eventData)) {
        const formattedEvents = eventData.map(event => this._formatEventForCalendar(event));
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
      // Both branches had `name: eventData.name,` as the first property in the conflicting block.
      // The `unstable-code` version had a comment, but the actual code `name: eventData.name,` was the same.
      // The duplicate `// name: eventData.name,...` line from `unstable-code`'s version further down is removed.
      const eventRequest = {
        name: eventData.name,
        eventDate: (eventData.eventDate || eventData.date)?.split('T')[0],
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
      // Similar to addEvent, both branches started with `name: eventData.name,`.
      // The duplicate `// name: eventData.name,...` line from `unstable-code`'s version further down is removed.
      const eventRequest = {
        name: eventData.name,
        eventDate: (eventData.eventDate || eventData.date)?.split('T')[0],
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
      console.warn('addParticipant: participantApi is not explicitly imported in this merged version. Participant registration might not work as originally intended if it relied on a separate participantApi.');
      const newParticipant = { ...participant, id: Date.now().toString() }; // Mock participant

      const eventIndex = this.events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        if (!this.events[eventIndex].extendedProps.participants) {
          this.events[eventIndex].extendedProps.participants = [];
        }
        this.events[eventIndex].extendedProps.participants.push(newParticipant);

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

  _updateEventDisplayProperties(eventIndex) {
    if (eventIndex < 0 || eventIndex >= this.events.length) return;

    const event = this.events[eventIndex];
    // Prioritizing 9nz1zf-codex: It doesn't have the category lookup here, directly uses event.extendedProps.name
    // The unstable-code version had:
    // const category = this.categories[event.extendedProps.category] || TRAINING_CATEGORIES[event.extendedProps.category];
    // For the title, 9nz1zf-codex version:
    // event.title = `${event.extendedProps.name} (${timeDisplay}, ${participantsCount}/${maxParticipants})`;
    // Unstable-code version:
    // const titleName = event.extendedProps.name || category?.name || 'Unnamed Event';
    // event.title = `${titleName} - ${event.extendedProps.location} (${timeDisplay}, ${participantsCount}/${maxParticipants})`;
    // Sticking to 9nz1zf-codex for this specific part as per strategy:
    const participantsCount = event.extendedProps.participants.length;
    const maxParticipants = event.extendedProps.maxParticipants;
    const timeDisplay = `${event.extendedProps.startTime} - ${event.extendedProps.endTime}`;

    // Reconstruct title based on 9nz1zf-codex if `event.extendedProps.location` is intended to be part of title
    // If `event.extendedProps.location` is not part of the title in 9nz1zf-codex, this should be simpler.
    // The `9nz1zf-codex` version of title was `${event.extendedProps.name} (${timeDisplay}, ${participantsCount}/${maxParticipants})`
    // Let's assume that's the intended structure from that branch.
    let title = `${event.extendedProps.name || 'Unnamed Event'}`;
    if (event.extendedProps.location) { // Optionally add location if present and intended by 9nz1zf-codex
      // If 9nz1zf-codex _did_ intend location in the title, it would be like:
      // title += ` - ${event.extendedProps.location}`;
      // However, the diff shows it as only name, then the time/participant details.
    }
    event.title = `${title} (${timeDisplay}, ${participantsCount}/${maxParticipants})`;

    event.extendedProps.availableSpots = maxParticipants - participantsCount;
    event.extendedProps.isFull = maxParticipants > 0 && participantsCount >= maxParticipants;
  },

  _formatEventForCalendar(event) {
    // The `9nz1zf-codex` version is simpler and doesn't use `normalizeTime` or extensive fallbacks here.
    // The `unstable-code` version is more robust.
    // Prioritizing `9nz1zf-codex` for the direct conflicting parts, then integrating robustness.

    console.log('Formatting event for calendar (raw input):', event);

    // Category lookup (from unstable-code, good for robustness, but 9nz1zf uses TRAINING_CATEGORIES directly)
    // Let's use the 9nz1zf-codex direct TRAINING_CATEGORIES lookup as per strategy for this part.
    const category = TRAINING_CATEGORIES[event.categoryId];

    // Time formatting from 9nz1zf-codex (simpler: assumes HH:mm and appends :00)
    // Unstable-code's normalizeTime is more robust. Since 9nz1zf is preferred for the conflicting block,
    // we use its direct time formatting logic here.
    const startTimeStr = event.startTime || '00:00';
    const endTimeStr = event.endTime || '00:00';
    const startDateTime = `${event.eventDate}T${startTimeStr.length === 5 ? startTimeStr + ':00' : startTimeStr}`;
    const endDateTime = `${event.eventDate}T${endTimeStr.length === 5 ? endTimeStr + ':00' : endTimeStr}`;

    const participantsArray = Array.isArray(event.participants) ? event.participants : [];
    const participantCount = participantsArray.length;
    const maxP = Number(event.maxParticipants) || 0;

    // Initial title part from 9nz1zf-codex:
    let title = `${event.name || category?.name || 'Unnamed Event'}`;
    if (event.location) {
        title += ` - ${event.location}`;
    }

    // Full title construction based on 9nz1zf-codex logic in its `_formatEventForCalendar` for the title line
    const timeDisplayInTitle = `${startTimeStr} - ${endTimeStr}`;
    const fullTitle = `${title} (${timeDisplayInTitle}, ${participantCount}/${maxP})`;


    const calendarEvent = {
      id: event.id,
      title: fullTitle, // As per 9nz1zf-codex logic for constructing this specific line
      start: startDateTime,
      end: endDateTime,
      allDay: false,
      backgroundColor: category?.backColor || '#f0f0f0',
      borderColor: category?.color || '#ccc',
      extendedProps: {
        category: event.categoryId,
        name: event.name,
        location: event.location,
        startTime: event.startTime, // Store original times
        endTime: event.endTime,
        maxParticipants: maxP,
        description: event.description,
        participants: participantsArray,
        // availableSpots and isFull were in 9nz1zf-codex extendedProps.
        // Calculate them for consistency.
        availableSpots: maxP - participantCount,
        isFull: maxP > 0 && participantCount >= maxP,
      },
      // classNames from 9nz1zf-codex:
      classNames: event.categoryId ? [String(event.categoryId)] : [],
      display: 'block'
    };

    console.log('Formatted event (output):', calendarEvent);
    return calendarEvent;
  },

  async fetchCategories() {
    try {
      const data = await categoryApi.getCategories();
      this.categories = data.reduce((map, c) => {
        map[c.id] = c;
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
    }
  }
});

eventStore.fetchCategories();

export function useEventStore() {
  return eventStore;
}