// src/composables/useCalendarViews.js
import { ref, watch } from 'vue';
import { formatDateToYYYYMMDD, refreshCalendar } from '../utils/calendarUtils';

/**
 * Composable for handling calendar view switching and related functionality
 * @param {Object} fullCalendar - Reference to the FullCalendar component
 * @param {Function} loadEventsByDay - Function to load events by day
 * @param {Function} loadEventsByMonth - Function to load events by month
 * @param {Object} stateRefs - Object containing state refs (currentYear, selectedMonth, etc.)
 * @returns {Object} Calendar view related functions and state
 */
export default function useCalendarViews(fullCalendar, loadEventsByDay, loadEventsByMonth, stateRefs) {
  const { currentYear, selectedMonth } = stateRefs;
  const currentView = ref('dayGridMonth'); // Default view is month

  /**
   * Set the calendar view type
   * @param {string} viewType - The view type to set
   */
  function setView(viewType) {
    currentView.value = viewType;
    
    try {
      if (fullCalendar.value && fullCalendar.value.getApi) {
        const api = fullCalendar.value.getApi();
        const availableViews = ['dayGridMonth', 'timeGridWeek', 'timeGridDay'];
        
        if (availableViews.includes(viewType)) {
          console.log(`Changing view to: ${viewType}`);
          // Use a timeout to ensure the view change happens after the current rendering cycle
          setTimeout(() => {
            api.changeView(viewType);
            console.log(`View successfully changed to: ${viewType}`);
          }, 0);
        } else {
          console.warn(`Invalid view type: ${viewType}`);
        }
      } else {
        console.warn('FullCalendar component not fully mounted yet');
      }
    } catch (error) {
      console.error('Error changing calendar view:', error);
    }
  }

  /**
   * Reload events based on the current view
   * @returns {Promise<void>}
   */
  async function reloadEventsByCurrentView() {
    try {
      if (currentView.value.includes('timeGrid')) {
        // For timeGrid views (day/week), load events for the specific day
        const selectedDate = fullCalendar.value?.getApi().getDate() || new Date();
        const formattedDate = formatDateToYYYYMMDD(selectedDate);
        await loadEventsByDay(formattedDate);
      } else {
        // For month view, load events for the month
        await loadEventsByMonth(currentYear.value, selectedMonth.value + 1);
      }
      
      // Force calendar refresh
      refreshCalendar(fullCalendar);
    } catch (error) {
      console.error('Error reloading events by view:', error);
    }
  }

  // Watch for view changes to load appropriate data
  watch(currentView, async (newView) => {
    await reloadEventsByCurrentView();
  });

  return {
    currentView,
    setView,
    reloadEventsByCurrentView
  };
}