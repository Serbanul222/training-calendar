/**
 * Authentication utility functions for JWT token handling and role-based access control
 */

/**
 * Get the JWT token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export function getToken() {
  return localStorage.getItem('jwt');
}

/**
 * Set the JWT token in localStorage
 * @param {string} token - The JWT token to store
 */
export function setToken(token) {
  localStorage.setItem('jwt', token);
}

/**
 * Remove the JWT token from localStorage
 */
export function removeToken() {
  localStorage.removeItem('jwt');
}

/**
 * Decode a JWT token
 * @param {string} token - The JWT token to decode
 * @returns {object|null} The decoded payload or null if invalid
 */
export function decodeToken(token = getToken()) {
  if (!token) return null;
  
  try {
    // JWT tokens consist of three parts: header.payload.signature
    const base64Url = token.split('.')[1];
    // Replace non-base64 URL chars and decode
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Decode and parse the JSON payload
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Get the current user's roles from the JWT token
 * @returns {Array} Array of user roles, empty if not found
 */
export function getUserRoles() {
  const decodedToken = decodeToken();
  // Check for roles in the token - the actual property name may vary
  // Common variations include: 'roles', 'role', 'authorities', 'scopes'
  return decodedToken?.roles || decodedToken?.role || 
         (decodedToken?.authority ? [decodedToken.authority] : []);
}

/**
 * Check if the user is authenticated (has a valid token)
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  
  // Optional: Check if token is expired
  const decodedToken = decodeToken(token);
  if (!decodedToken) return false;
  
  // Check expiration time if 'exp' claim exists
  if (decodedToken.exp) {
    const currentTime = Math.floor(Date.now() / 1000); // in seconds
    if (decodedToken.exp < currentTime) {
      // Token is expired, remove it
      removeToken();
      return false;
    }
  }
  
  return true;
}

/**
 * Check if the current user has admin role
 * @returns {boolean} True if user has admin role, false otherwise
 */
export function isAdmin() {
  const roles = getUserRoles();
  return roles.some(role => 
    ['ADMIN', 'ROLE_ADMIN', 'admin'].includes(role.toUpperCase ? role.toUpperCase() : role)
  );
}

/**
 * Log out the current user by removing the token
 * and resetting application state
 */
export function logout() {
  // Remove token from localStorage
  removeToken();
  
  // Reset any application state if needed
  // If using Vuex/Pinia, you would dispatch a reset action here
  
  // Force reload the page to reset all component states
  // Alternative to this would be programmatically navigating using Vue Router
  window.location.href = '/';
}

