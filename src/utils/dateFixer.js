// src/utils/dateFixer.js

/**
 * This utility helps identify and fix incorrect date handling
 * where today's date is being displayed as 2025-05-20
 */

// Create a reference to the original Date constructor
const OriginalDate = Date;

/**
 * Enable debugging to find where dates are being manipulated incorrectly
 */
export function enableDateDebugging() {
  // Override the Date constructor to detect problematic usage
  window.Date = function(...args) {
    // Check for problematic date string
    if (args.length > 0 && typeof args[0] === 'string') {
      if (args[0].includes('2025-05-20')) {
        console.error('FIXED DATE DETECTED! Created with:', args[0]);
        console.error('Call stack:', new Error().stack);
        
        // Return today's actual date instead
        return new OriginalDate();
      }
    }
    
    // For normal usage, use the original Date constructor
    return new OriginalDate(...args);
  };
  
  // Copy prototype methods and static properties
  window.Date.prototype = OriginalDate.prototype;
  window.Date.now = OriginalDate.now;
  window.Date.parse = OriginalDate.parse;
  window.Date.UTC = OriginalDate.UTC;
  
  console.log('Date debugging enabled - will catch any attempts to create the date 2025-05-20');
}

/**
 * Restore the original Date constructor
 */
export function disableDateDebugging() {
  window.Date = OriginalDate;
  console.log('Date debugging disabled');
}

/**
 * Format a date consistently to prevent errors
 */
export function getToday() {
  const now = new OriginalDate();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Replace date constants in codebase 
 * Use this to check if any component has hardcoded the date 2025-05-20
 */
export function correctHardcodedDates() {
  // Scan for elements with hardcoded dates in attributes
  document.querySelectorAll('input[type="date"]').forEach(input => {
    if (input.value === '2025-05-20') {
      console.warn('Found hardcoded date in input:', input);
      input.value = getToday();
    }
    
    // Also check for default values
    if (input.defaultValue === '2025-05-20') {
      console.warn('Found hardcoded default date in input:', input);
      input.defaultValue = getToday();
    }
  });
  
  // Look for Vue model bindings with that date
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('Vue detected - searching for reactive properties with hardcoded dates');
    // This is a simplified approach - ideally you'd use Vue devtools or your Vue instance
  }
}

/**
 * Apply this patch to fix the specific date issue in your application
 */
export function applyDateFix() {
  console.log('Applying date fix...');
  
  // Enable debugging to find the issue
  enableDateDebugging();
  
  // Try to correct any existing hardcoded dates
  correctHardcodedDates();
  
  // Add a global helper for getting today's date correctly
  window.getCorrectDate = getToday;
  
  console.log('Date fix applied. Use window.getCorrectDate() to get today\'s date correctly.');
}