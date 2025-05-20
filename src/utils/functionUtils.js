// src/utils/functionUtils.js

/**
 * Simple debounce function implementation
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param {Function} func - The function to debounce
 * @param {number} wait - Milliseconds to wait before invoking
 * @returns {Function} Debounced function
 */
export const debounce = function(func, wait) {
  let timeout;
  
  return function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};