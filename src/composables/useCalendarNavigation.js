// src/composables/useCalendarNavigation.js
import { ref } from 'vue';

export default function useCalendarNavigation(calendarRef) {
  const currentYear = ref(new Date().getFullYear());
  const selectedMonth = ref(new Date().getMonth());
  const selectedDate = ref('');

  // Update displayed dates based on calendar navigation
  function handleDatesSet(arg) {
    const date = arg.view.currentStart;
    currentYear.value = date.getFullYear();
    selectedMonth.value = date.getMonth();
  }


function forceCalendarRefresh() {
  if (!calendarRef.value || !calendarRef.value.getApi) {
    console.error('Calendar reference is not available');
    return;
  }
  
  try {
    console.log("Forcing calendar refresh");
    const api = calendarRef.value.getApi();
    
    // Simply rerender the calendar - don't remove events
    api.render();
    
    console.log("Calendar refresh complete");
  } catch (error) {
    console.error('Error refreshing calendar:', error);
  }
}

  // Go to the previous month
  function previousMonth() {
    if (selectedMonth.value === 0) {
      selectedMonth.value = 11;
      currentYear.value--;
    } else {
      selectedMonth.value--;
    }
  }

  // Go to the next month
  function nextMonth() {
    if (selectedMonth.value === 11) {
      selectedMonth.value = 0;
      currentYear.value++;
    } else {
      selectedMonth.value++;
    }
  }

  // Update admin mode in calendar
  function updateCalendarEditableOptions(calendarRef, isAdmin) {
    if (!calendarRef.value) return;
    
    try {
      const calendarApi = calendarRef.value.getApi();
      calendarApi.setOption('selectable', isAdmin);
      calendarApi.setOption('editable', isAdmin);
    } catch (error) {
      console.error('Error updating calendar options:', error);
    }
  }

  return {
    currentYear,
    selectedMonth,
    selectedDate,
    handleDatesSet,
    forceCalendarRefresh,
    previousMonth,
    nextMonth,
    updateCalendarEditableOptions
  };
}