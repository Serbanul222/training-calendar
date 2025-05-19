// src/store/eventStore.js
import { reactive, markRaw } from 'vue';
import { TRAINING_CATEGORIES } from '../constants/trainingCategories';

const STORAGE_KEY = 'training-calendar-events';

// Simple memoization function to cache repeated operations
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

export function useEventStore() {
  // Use a reactive array for events with markRaw to prevent deep reactivity
  const events = reactive([]);
  
  // Generate sample events for demo
  const generateSampleEvents = memoize(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return [
      {
        id: '1',
        title: 'ZIUA CONSULTANȚEI - București (0/10)',
        start: new Date(year, month, 15).toISOString().split('T')[0],
        end: new Date(year, month, 15).toISOString().split('T')[0],
        allDay: true,
        backgroundColor: TRAINING_CATEGORIES['CONSULTANTA'].backColor,
        borderColor: TRAINING_CATEGORIES['CONSULTANTA'].color,
        extendedProps: markRaw({
          category: 'CONSULTANTA',
          location: 'București',
          maxParticipants: 10,
          description: 'Training event for consultancy',
          participants: []
        }),
        classNames: ['CONSULTANTA'],
        display: 'block'
      },
      {
        id: '2',
        title: 'ZIUA OPTOMETRIEI - Cluj (0/8)',
        start: new Date(year, month, 20).toISOString().split('T')[0],
        end: new Date(year, month, 20).toISOString().split('T')[0],
        allDay: true,
        backgroundColor: TRAINING_CATEGORIES['OPTOMETRIE'].backColor,
        borderColor: TRAINING_CATEGORIES['OPTOMETRIE'].color,
        extendedProps: markRaw({
          category: 'OPTOMETRIE',
          location: 'Cluj',
          maxParticipants: 8,
          description: 'Training event for optometry',
          participants: []
        }),
        classNames: ['OPTOMETRIE'],
        display: 'block'
      },
      {
        id: '3',
        title: 'ZIUA PRODUSELOR HOYA - Timișoara (0/12)',
        start: new Date(year, month, 25).toISOString().split('T')[0],
        end: new Date(year, month, 25).toISOString().split('T')[0],
        allDay: true,
        backgroundColor: TRAINING_CATEGORIES['PRODUSE_HOYA'].backColor,
        borderColor: TRAINING_CATEGORIES['PRODUSE_HOYA'].color,
        extendedProps: markRaw({
          category: 'PRODUSE_HOYA',
          location: 'Timișoara',
          maxParticipants: 12,
          description: 'Training event for HOYA products',
          participants: []
        }),
        classNames: ['PRODUSE_HOYA'],
        display: 'block'
      }
    ];
  });
  
  // Load events from localStorage - optimized to reduce unnecessary processing
  function loadEvents() {
    try {
      // Check if we already have events loaded
      if (events.length > 0) {
        console.log('Events already loaded, skipping load');
        return;
      }
      
      const savedEvents = localStorage.getItem(STORAGE_KEY);
      if (!savedEvents) {
        // No saved events, load samples
        const sampleEvents = generateSampleEvents();
        events.push(...sampleEvents);
        console.log('Loaded sample events:', events.length);
        return;
      }
      
      // Parse saved events
      const loadedEvents = JSON.parse(savedEvents);
      if (!Array.isArray(loadedEvents) || loadedEvents.length === 0) {
        // Invalid saved events, load samples
        const sampleEvents = generateSampleEvents();
        events.push(...sampleEvents);
        console.log('Invalid saved events, loaded sample events:', events.length);
        return;
      }
      
      // Clear events array and add loaded events
      events.length = 0; // Faster than splice for clearing
      loadedEvents.forEach(event => {
        // Mark extendedProps as raw to prevent deep reactivity
        if (event.extendedProps) {
          event.extendedProps = markRaw(event.extendedProps);
        }
        events.push(event);
      });
      
      console.log('Loaded events from storage:', events.length);
    } catch (error) {
      console.error('Error loading events:', error);
      
      // Clear events array and add sample events
      events.length = 0;
      const sampleEvents = generateSampleEvents();
      events.push(...sampleEvents);
    }
  }
  
  // Save events to localStorage - debounced to prevent too frequent saves
  let saveTimeout = null;
  function saveEvents() {
    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set new timeout to debounce saves
    saveTimeout = setTimeout(() => {
      try {
        // Create a simplified copy of events for storage
        const eventsToSave = events.map(event => {
          // Create simplified copy without deep Vue reactivity
          const simplifiedEvent = { ...event };
          if (event.extendedProps) {
            simplifiedEvent.extendedProps = { ...event.extendedProps };
          }
          return simplifiedEvent;
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToSave));
      } catch (error) {
        console.error('Error saving events:', error);
      }
    }, 300); // Debounce time
  }
  
  // Add a new event - optimized
  function addEvent(eventData) {
    const category = TRAINING_CATEGORIES[eventData.category];
    if (!category) {
      console.error('Invalid category:', eventData.category);
      return null;
    }
    
    const id = eventData.id || Date.now().toString();
    
    // Ensure we have a date
    if (!eventData.date) {
      console.error('No date provided for event');
      return null;
    }
    
    const participants = eventData.participants || [];
    const maxParticipants = eventData.maxParticipants || 10;
    
    // Create the new event with markRaw for performance
    const newEvent = {
      id,
      title: `${category.name} - ${eventData.location} (${participants.length}/${maxParticipants})`,
      start: eventData.date,
      end: eventData.date,
      allDay: true,
      extendedProps: markRaw({
        category: eventData.category,
        location: eventData.location,
        maxParticipants: maxParticipants,
        description: eventData.description || '',
        participants: [...participants]
      }),
      classNames: [eventData.category],
      display: 'block',
      backgroundColor: category.backColor,
      borderColor: category.color
    };
    
    // Add to the reactive array
    events.push(newEvent);
    saveEvents();
    
    return { ...newEvent, extendedProps: { ...newEvent.extendedProps } };
  }
  
  // Update an existing event - optimized
  function updateEvent(eventData) {
    const index = events.findIndex(e => e.id === eventData.id);
    if (index === -1) {
      console.error('Event not found for update:', eventData.id);
      return null;
    }
    
    const category = TRAINING_CATEGORIES[eventData.category];
    if (!category) {
      console.error('Invalid category for update:', eventData.category);
      return null;
    }
    
    // Create copies of data to avoid reference issues
    const participants = eventData.participants ? [...eventData.participants] : 
                         events[index].extendedProps.participants ? [...events[index].extendedProps.participants] : [];
    const maxParticipants = eventData.maxParticipants || 10;
    
    // Create the updated event
    const updatedEvent = {
      ...events[index],
      id: eventData.id,
      title: `${category.name} - ${eventData.location} (${participants.length}/${maxParticipants})`,
      start: eventData.date || events[index].start,
      end: eventData.date || events[index].end,
      allDay: true,
      extendedProps: markRaw({
        category: eventData.category,
        location: eventData.location,
        maxParticipants: maxParticipants,
        description: eventData.description || '',
        participants: participants
      }),
      classNames: [eventData.category],
      backgroundColor: category.backColor,
      borderColor: category.color
    };
    
    // Update in place - better performance than creating a new array
    events[index] = updatedEvent;
    saveEvents();
    
    return { ...updatedEvent, extendedProps: { ...updatedEvent.extendedProps } };
  }
  
  // Delete an event - optimized
  function deleteEvent(id) {
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return false;
    
    // Remove event in-place
    events.splice(index, 1);
    saveEvents();
    
    return true;
  }
  
  // Add a participant to an event - optimized
  function addParticipant(eventId, participant) {
    const index = events.findIndex(e => e.id === eventId);
    if (index === -1) {
      console.error('Event not found for adding participant:', eventId);
      return false;
    }
    
    const event = events[index];
    const extendedProps = event.extendedProps;
    
    if (!extendedProps.participants) {
      extendedProps.participants = [];
    }
    
    // Check if event is full
    if (extendedProps.participants.length >= extendedProps.maxParticipants) {
      console.error('Event is full');
      return false;
    }
    
    // Create a new participant object
    const newParticipant = {
      id: participant.id || Date.now().toString(),
      participantEmail: participant.participantEmail || '',
      participantName: participant.participantName || '',
      managerEmail: participant.managerEmail || '',
      location: participant.location || ''
    };
    
    // Add participant
    extendedProps.participants.push(newParticipant);
    
    // Update event title to show participant count
    const category = TRAINING_CATEGORIES[extendedProps.category];
    event.title = `${category.name} - ${extendedProps.location} (${extendedProps.participants.length}/${extendedProps.maxParticipants})`;
    
    saveEvents();
    return true;
  }
  
  // Clear all events (for testing/debugging)
  function clearEvents() {
    events.length = 0;
    saveEvents();
  }
  
  return {
    events,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    addParticipant,
    clearEvents
  };
}