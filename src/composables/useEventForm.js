// src/composables/useEventForm.js
import { reactive, ref, computed, watch } from 'vue';
import { formatDateToYYYYMMDD } from '../utils/calendarUtils';
import { debounce } from '../utils/functionUtils';

/**
 * Composable for handling event form logic
 * @param {Object} params - Parameters for the composable
 * @returns {Object} Form state and methods
 */
export default function useEventForm({
  checkTimeConflict,
  isEditMode,
  initialData,
  eventDate
}) {
  // Form state
  const formData = reactive({
    id: '',
    category: 'CONSULTANTA',
    location: '',
    date: eventDate || '',
    startTime: '09:00',
    endTime: '17:00',
    maxParticipants: 10,
    description: '',
    participants: []
  });
  
  // Form validation state
  const loading = ref(false);
  const error = ref(null);
  const timeConflict = ref(false);
  const lastConflictCheck = ref('');
  
  // Initialize form with initial data
  if (isEditMode.value && initialData) {
    Object.assign(formData, {
      id: initialData.id || '',
      category: initialData.category || 'CONSULTANTA',
      location: initialData.location || '',
      date: initialData.date || eventDate || '',
      startTime: initialData.startTime || '09:00',
      endTime: initialData.endTime || '17:00',
      maxParticipants: initialData.maxParticipants || 10,
      description: initialData.description || '',
      participants: initialData.participants || []
    });
  }
  
  // Check if date is preselected
  const datePreselected = computed(() => !!eventDate);
  
  // Validate form data
  const isFormValid = computed(() => {
    return formData.category && 
           formData.location && 
           formData.date && 
           formData.startTime && 
           formData.endTime && 
           formData.startTime < formData.endTime && 
           formData.maxParticipants > 0;
  });
  
  /**
   * Check for time conflicts with existing events
   */
  async function checkForTimeConflicts() {
    // Skip the check if all required fields aren't present yet
    if (!formData.date || !formData.startTime || !formData.endTime) {
      timeConflict.value = false;
      error.value = null;
      return;
    }
    
    // Validate that end time is after start time
    if (formData.endTime <= formData.startTime) {
      timeConflict.value = false; // This isn't a conflict with other events
      error.value = 'End time must be after start time';
      return;
    }
    
    try {
      // Skip redundant checks for the same parameters
      const checkKey = `${formData.date}_${formData.startTime}_${formData.endTime}_${isEditMode.value ? formData.id : 'new'}`;
      
      if (lastConflictCheck.value === checkKey) {
        console.log('Skipping redundant time conflict check with same parameters');
        return;
      }
      
      lastConflictCheck.value = checkKey;
      
      // Format the date correctly
      const formattedDate = formatDateToYYYYMMDD(formData.date);
      
      console.log('Checking time conflict:', {
        date: formattedDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        excludeEventId: isEditMode.value ? formData.id : null
      });
      
      // Only proceed with check if we have valid data
      if (!formattedDate || !formData.startTime || !formData.endTime) {
        timeConflict.value = false;
        error.value = null;
        return;
      }
      
      const hasConflict = await checkTimeConflict(
        formattedDate, 
        formData.startTime, 
        formData.endTime, 
        isEditMode.value ? formData.id : null
      );
      
      console.log('Conflict check result:', hasConflict);
      
      timeConflict.value = hasConflict;
      if (hasConflict) {
        error.value = 'This time slot conflicts with another event. Please choose a different time.';
      } else if (!error.value || error.value.includes('time slot conflicts')) {
        // Only clear error if it's a conflict error
        error.value = null;
      }
    } catch (err) {
      console.error('Error checking time conflicts:', err);
      timeConflict.value = false;
      if (error.value && error.value.includes('time slot conflicts')) {
        error.value = null;
      }
    }
  }
  
  // Create a debounced version of the conflict check function
  const debouncedCheckForConflicts = debounce(checkForTimeConflicts, 500);
  
  /**
   * Validate that end time is after start time
   * @returns {boolean} Validation result
   */
  function validateTimes() {
    if (!formData.startTime || !formData.endTime) {
      return true; // Skip validation if times not set
    }
    
    if (formData.endTime <= formData.startTime) {
      error.value = 'End time must be after start time';
      return false;
    }
    
    error.value = null;
    return true;
  }
  
  /**
   * Reset form to default values
   */
  function resetForm() {
    formData.id = '';
    formData.category = 'CONSULTANTA';
    formData.location = '';
    formData.date = eventDate || '';
    formData.startTime = '09:00';
    formData.endTime = '17:00';
    formData.maxParticipants = 10;
    formData.description = '';
    formData.participants = [];
    
    error.value = null;
    timeConflict.value = false;
    lastConflictCheck.value = '';
  }
  
  /**
   * Prepare form data for submission
   * @returns {Object} Formatted form data
   */
  function getFormData() {
    return {
      ...formData,
      date: formatDateToYYYYMMDD(formData.date)
    };
  }
  
  // Watch for changes to time/date fields
  watch(() => [formData.date, formData.startTime, formData.endTime], 
    () => {
      // Clear any previous conflict errors when input changes
      if (error.value && error.value.includes('time slot conflicts')) {
        error.value = null;
      }
      
      // Reset conflict flag when inputs change
      timeConflict.value = false;
      
      // Only check for conflicts if we have all required fields
      if (formData.date && formData.startTime && formData.endTime && 
          formData.startTime < formData.endTime) {
        debouncedCheckForConflicts();
      }
    }, 
    { deep: true }
  );
  
  // Return state and methods
  return {
    formData,
    loading,
    error,
    timeConflict,
    datePreselected,
    isFormValid,
    checkForTimeConflicts,
    validateTimes,
    resetForm,
    getFormData
  };
}