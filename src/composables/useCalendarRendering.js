// src/composables/useCalendarRendering.js
import { computed } from 'vue';
import { markRaw } from 'vue';
import roLocale from '@fullcalendar/core/locales/ro';

/**
 * Composable for handling calendar rendering options
 * @param {Object} params - Parameters for the composable
 * @returns {Object} Calendar rendering functions and options
 */
export default function useCalendarRendering({
  events,
  isAdmin,
  currentYear,
  selectedMonth,
  handleEventClick,
  handleDateClick,
  handleDatesSet,
  plugins
}) {
  /**
   * Default event content renderer for calendar events
   * @param {Object} eventInfo - Event information
   * @returns {Object} HTML content for the event
   */
  function defaultEventContentRenderer(eventInfo) {
    try {
      const category = eventInfo.event.extendedProps?.category || '';
      const location = eventInfo.event.extendedProps?.location || '';
      const participants = eventInfo.event.extendedProps?.participants || [];
      const maxParticipants = eventInfo.event.extendedProps?.maxParticipants || 0;
      
      // Create participant info text
      const participantInfo = `${participants.length}/${maxParticipants}`;
      
      // Build HTML for the event with appropriate classes for the category
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
      // Fallback rendering
      return {
        html: `<div class="fc-event-main-content"><div class="fc-event-title">${eventInfo.event.title}</div></div>`
      };
    }
  }

  /**
   * Calendar options for FullCalendar
   */
 const calendarOptions = computed(() => {
  console.log('Rendering calendar with events:', events.length);
  if (events.length > 0) {
    console.log('Sample event in calendar options:', events[0]);
  }
  
  return {
    plugins,
    initialView: 'dayGridMonth',
    locale: roLocale, // Make sure this is properly imported
    firstDay: 1, // Monday
    headerToolbar: false, // We'll create our own header
    events: events, // Make sure this is reactive
    selectable: isAdmin.value,
    editable: isAdmin.value,
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventContent: defaultEventContentRenderer,
    datesSet: handleDatesSet,
    height: 'auto',
    displayEventEnd: true, // Changed to true to show end time
    dayMaxEventRows: true,
    initialDate: new Date(currentYear.value, selectedMonth.value, 1),
    
    // Time grid specific options
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false, // Changed to false for time-specific events
    
    // Configure each view specifically
    views: {
      dayGridMonth: {
        dayMaxEventRows: 4,
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      },
      timeGridWeek: {
        slotLabelFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        },
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      },
      timeGridDay: {
        dayHeaderFormat: {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        },
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      }
    },
    
    // Event rendering options
    eventDidMount: (info) => {
      // Add tooltip or any additional rendering
      console.log('Event mounted in calendar:', info.event.title);
    }
  };
});

  return {
    calendarOptions,
    defaultEventContentRenderer
  };
}