// src/utils/calendarConfig.js
import { markRaw } from 'vue';

export function createCalendarOptions({
  plugins,
  roLocale,
  events,
  isAdmin,
  currentYear,
  selectedMonth,
  onEventClick,
  onDateClick,
  onDatesSet,
  renderEventContent
}) {
  return {
    plugins,
    initialView: 'dayGridMonth',
    locale: roLocale,
    firstDay: 1, // Monday
    headerToolbar: false,
    events: events, // Direct binding to reactive array
    selectable: isAdmin,
    editable: isAdmin,
    eventClick: markRaw(onEventClick),
    dateClick: markRaw(onDateClick),
    eventContent: markRaw(renderEventContent),
    datesSet: markRaw(onDatesSet),
    height: 'auto',
    displayEventEnd: false,
    dayMaxEventRows: true,
    initialDate: new Date(currentYear, selectedMonth, 1),
    // Add these for stability
    eventTimeFormat: { hour: '2-digit', minute: '2-digit' },
    showNonCurrentDates: true,
    fixedWeekCount: false
  };
}

export function defaultEventContentRenderer(eventInfo) {
  try {
    return {
      html: `
        <div class="fc-event-main-content">
          <div class="fc-event-title">${eventInfo.event.title}</div>
        </div>
      `
    };
  } catch (error) {
    return {
      html: `<div class="fc-event-main-content"><div class="fc-event-title">${eventInfo.event.title}</div></div>`
    };
  }
}