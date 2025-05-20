/**
 * Format a date to yyyy-MM-dd format without time or timezone information
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateToYYYYMMDD(date) {
  if (!date) return '';
  
  // Handle string input that already looks like YYYY-MM-DD
  if (typeof date === 'string') {
    // If it's an ISO string or contains time info, extract just the date part
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    
    // If it already matches YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
  }
  
  // Convert to Date object and validate
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }
  
  // Format to yyyy-MM-dd
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Force calendar to refresh events and view
 * @param {Object} calendarRef - Reference to FullCalendar component
 */
export function refreshCalendar(calendarRef) {
  if (!calendarRef?.value || !calendarRef.value.getApi) {
    console.warn('Calendar API not available for refresh');
    return;
  }
  
  try {
    const api = calendarRef.value.getApi();
    if (api) {
      // Refetch all events
      api.refetchEvents();
      
      // Force rerender current view
      const currentView = api.view.type;
      api.changeView(currentView);
      
      console.log('Calendar refreshed successfully');
    }
  } catch (error) {
    console.error('Error refreshing calendar:', error);
  }
}

/**
 * Extract time from a date object in HH:MM format
 * @param {Date} date - Date object
 * @returns {string} Time in HH:MM format
 */
export function extractTimeFromDate(date) {
  if (!date || !(date instanceof Date)) return '00:00';
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Calculate end time based on start time (adding 1 hour)
 * @param {string} startTime - Start time in HH:MM format
 * @returns {string} End time in HH:MM format
 */
export function calculateEndTime(startTime) {
  if (!startTime) return '00:00';
  
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHour = (hours + 1) % 24;
  
  return `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}