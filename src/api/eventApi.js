import apiClient from './index';

/**
 * Helper function to format a date input (JS Date object or a parseable date string)
 * into 'yyyy-MM-dd' format.
 * @param {Date|string} dateInput - The date to format.
 * @returns {string} The date formatted as 'yyyy-MM-dd', or an empty string if input is invalid.
 */
function formatDateToYYYYMMDD(dateInput) {
  if (!dateInput) {
    // console.warn("formatDateToYYYYMMDD received null or undefined input.");
    return ''; // Or handle as an error, or return undefined depending on desired behavior
  }

  const d = new Date(dateInput);

  // Check if the date is valid after parsing
  if (isNaN(d.getTime())) {
    console.error("Invalid dateInput for formatDateToYYYYMMDD:", dateInput);
    // Attempt to return the date part if it's a string that looks like YYYY-MM-DD...
    if (typeof dateInput === 'string' && dateInput.length >= 10 && dateInput.charAt(4) === '-' && dateInput.charAt(7) === '-') {
        return dateInput.substring(0, 10);
    }
    return ''; // Or throw an error: throw new Error(`Invalid date value: ${dateInput}`);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default {
  getEvents() {
    return apiClient.get('/events')
      .then(response => response.data);
  },

  getEventsByMonth(year, month) {
    return apiClient.get(`/events/month?year=${year}&month=${month}`)
      .then(response => response.data);
  },

  getEventsByDay(date) {
    const formattedDate = formatDateToYYYYMMDD(date);
    if (!formattedDate) {
        // Handle the case where date formatting failed, e.g., return a rejected promise
        return Promise.reject(new Error("Invalid date provided for getEventsByDay"));
    }
    return apiClient.get(`/events/day?date=${formattedDate}`)
      .then(response => response.data);
  },

  getEvent(id) {
    return apiClient.get(`/events/${id}`)
      .then(response => response.data);
  },

  createEvent(event) {
    // For JSON payloads (POST/PUT), Spring Boot's Jackson deserializer is often flexible
    // with date strings for LocalDate fields in DTOs.
    // If event.eventDate is a JavaScript Date object, it will likely be serialized to an
    // ISO 8601 string (e.g., "2025-05-01T00:00:00.000Z"). Spring can usually parse this
    // into a LocalDate (extracting the date part).
    // If event.eventDate is already a "yyyy-MM-dd" string, that's also typically fine.
    // Explicit formatting here (e.g., eventDate: formatDateToYYYYMMDD(event.eventDate))
    // might be needed if you encounter issues or if your backend DTO has strict @DateTimeFormat.
    return apiClient.post('/events', event)
      .then(response => response.data);
  },

  updateEvent(id, event) {
    // Similar considerations as createEvent regarding event.eventDate formatting.
    return apiClient.put(`/events/${id}`, event)
      .then(response => response.data);
  },

  deleteEvent(id) {
    return apiClient.delete(`/events/${id}`);
  },

  getEventsByCategory(categoryId) {
    return apiClient.get(`/events/category/${categoryId}`)
      .then(response => response.data);
  },

  checkTimeConflict(date, startTime, endTime, excludeEventId = null) {
    const formattedDate = formatDateToYYYYMMDD(date);
    if (!formattedDate) {
        return Promise.reject(new Error("Invalid date provided for checkTimeConflict"));
    }

    // Ensure startTime and endTime are valid time strings (e.g., HH:mm)
    // No specific formatting needed here if they are already in the correct string format.

    let url = `/events/check-conflict?date=${formattedDate}&startTime=${startTime}&endTime=${endTime}`;
    if (excludeEventId) {
      url += `&excludeEventId=${excludeEventId}`;
    }
    return apiClient.get(url)
      .then(response => response.data);
  },

  checkEventAvailability(id) {
    return apiClient.get(`/events/${id}/available`)
      .then(response => response.data);
  }
};