// src/utils/calendarConfig.js

/**
 * Creates calendar options for FullCalendar component
 * @param {Object} config - Configuration object
 * @returns {Object} Calendar options object
 */
export function createCalendarOptions(config) {
  const {
    plugins,
    roLocale,
    events,
    isAdmin,
    currentYear,
    selectedMonth,
    calendarView,
    onEventClick,
    onDateClick,
    onDatesSet,
    renderEventContent
  } = config;

  return {
    plugins,
    initialView: calendarView || 'dayGridMonth',
    locale: roLocale,
    firstDay: 1, // Monday
    headerToolbar: false, // We'll create our own header
    events,
    selectable: isAdmin,
    editable: isAdmin,
    eventClick: onEventClick,
    dateClick: onDateClick,
    eventContent: renderEventContent,
    datesSet: onDatesSet,
    height: 'auto', // Dynamically adjust height based on content
    initialDate: new Date(currentYear, selectedMonth, 1),
    
    // Important: These options are necessary for the different views
    dayMaxEvents: true, // For month view
    allDaySlot: true, // Show all-day slot in time grid views
    slotMinTime: '08:00:00', // Start time for time grid views
    slotMaxTime: '20:00:00', // End time for time grid views
    slotDuration: '00:30:00', // 30 minute slots
    slotLabelInterval: '01:00:00', // Show labels every hour
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: false,
      hour12: false
    },
    
    // View-specific options
    views: {
      dayGridMonth: {
        dayMaxEventRows: 4, // Limit number of events per day in month view
      },
      timeGridWeek: {
        slotLabelFormat: {
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
          hour12: false
        }
      },
      timeGridDay: {
        // For day view
        dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric' },
      }
    }
  };
}

/**
 * Default event content renderer for calendar events
 * @param {Object} eventInfo - Event information from FullCalendar
 * @returns {Object} Rendered content configuration
 */
export function defaultEventContentRenderer(eventInfo) {
  try {
    const category = eventInfo.event.extendedProps?.category || '';
    const location = eventInfo.event.extendedProps?.location || '';
    const participants = eventInfo.event.extendedProps?.participants || [];
    const maxParticipants = eventInfo.event.extendedProps?.maxParticipants || 0;
    
    // Create participant info text
    const participantInfo = `${participants.length}/${maxParticipants}`;
    
    // Build HTML for the event, with appropriate classes for the category
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