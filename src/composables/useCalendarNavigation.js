// src/composables/useCalendarNavigation.js

import { ref, onMounted } from 'vue';

/**
 * Composable for handling calendar navigation and related functions
 * @param {Object} calendarRef - Ref to the FullCalendar component
 * @returns {Object} Calendar navigation functions and state
 */
export default function useCalendarNavigation(calendarRef) {
  // Calendar navigation state
  const currentYear = ref(new Date().getFullYear());
  const selectedMonth = ref(new Date().getMonth());
  const selectedDate = ref('');

  // Handle dates set in the calendar - updates the year and month
  const handleDatesSet = (arg) => {
    try {
      const date = arg.view.currentStart;
      currentYear.value = date.getFullYear();
      selectedMonth.value = date.getMonth();
    } catch (error) {
      console.error('Error handling dates set:', error);
    }
  };

  // Force calendar to refresh
  const forceCalendarRefresh = () => {
    try {
      console.log('Forcing calendar refresh');
      if (!calendarRef.value || !calendarRef.value.getApi) {
        console.warn('Calendar API not available for refresh');
        return;
      }
      
      const api = calendarRef.value.getApi();
      if (api) {
        // Force rerender
        api.refetchEvents();
        
        // Make sure the view is up to date
        const shouldBeView = api.view.type;
        api.changeView(shouldBeView);
        
        console.log('Calendar refresh complete');
      }
    } catch (error) {
      console.error('Error during calendar refresh:', error);
    }
  };

  // Update calendar editable options
  const updateCalendarEditableOptions = (calendarRef, isAdmin) => {
    try {
      if (!calendarRef.value || !calendarRef.value.getApi) {
        console.warn('Calendar API not available for updating options');
        return;
      }
      
      const api = calendarRef.value.getApi();
      if (api) {
        api.setOption('selectable', isAdmin);
        api.setOption('editable', isAdmin);
      }
    } catch (error) {
      console.error('Error updating calendar options:', error);
    }
  };

  // Set up initial state when component is mounted
  onMounted(() => {
    // If no specific date is selected, use current date
    if (!selectedDate.value) {
      selectedDate.value = new Date().toISOString().split('T')[0];
    }
  });

  return {
    currentYear,
    selectedMonth,
    selectedDate,
    handleDatesSet,
    forceCalendarRefresh,
    updateCalendarEditableOptions
  };
}