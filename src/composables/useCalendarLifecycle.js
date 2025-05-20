// src/composables/useCalendarLifecycle.js
import { onMounted, onUnmounted, ref } from 'vue';
import { refreshCalendar } from '../utils/calendarUtils';

/**
 * Composable for handling calendar lifecycle events (initialization, periodic refresh, cleanup)
 * @param {Object} params - Parameters for the composable
 * @returns {Object} Calendar lifecycle management functions and state
 */
export default function useCalendarLifecycle({
  fullCalendar,
  currentView,
  loadEventsByMonth,
  currentYear,
  selectedMonth,
  reloadEventsByCurrentView
}) {
  // Auto-refresh interval reference
  const refreshInterval = ref(null);
  
  /**
   * Initialize the calendar on component mount
   */
  function initializeCalendar() {
    onMounted(async () => {
      console.log('TrainingCalendar component mounted');
      
      // Load initial events (adding 1 to month index for API which expects 1-12)
      await loadEventsByMonth(currentYear.value, selectedMonth.value + 1);
      
      // Initialize calendar view after a short delay to ensure full component mounting
      setTimeout(() => {
        try {
          if (fullCalendar.value && fullCalendar.value.getApi) {
            console.log('FullCalendar API is available');
            
            // Set the initial view
            const api = fullCalendar.value.getApi();
            api.changeView(currentView.value);
            
            console.log(`Calendar view initialized to: ${currentView.value}`);
          } else {
            console.warn('FullCalendar API not available after mounting');
          }
        } catch (error) {
          console.error('Error initializing calendar view:', error);
        }
      }, 300);
      
      // Set up auto-refresh interval
      setupAutoRefresh();
    });
  }
  
  /**
   * Set up automatic periodic refresh of calendar data
   * @param {number} interval - Refresh interval in milliseconds (default: 60000)
   */
  function setupAutoRefresh(interval = 60000) {
    // Clear any existing interval first
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
    }
    
    // Create new interval
    refreshInterval.value = setInterval(async () => {
      console.log('Periodic events refresh');
      await reloadEventsByCurrentView();
    }, interval);
    
    // Clean up interval when component is unmounted
    onUnmounted(() => {
      console.log('Clearing refresh interval');
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
        refreshInterval.value = null;
      }
    });
  }
  
  /**
   * Manually refresh calendar data and view
   */
  async function refreshCalendarData() {
    try {
      await reloadEventsByCurrentView();
      refreshCalendar(fullCalendar);
      console.log('Calendar refreshed manually');
    } catch (error) {
      console.error('Error during manual calendar refresh:', error);
    }
  }
  
  // Initialize the calendar when the composable is used
  initializeCalendar();
  
  return {
    refreshCalendarData,
    setupAutoRefresh
  };
}