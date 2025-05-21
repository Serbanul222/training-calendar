/**
 * Authentication utility functions for JWT token handling and role-based access control
 */

// Hardcoded API URL - replace with your actual backend URL
const API_URL = 'http://localhost:8080';

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
  if (!decodedToken) return [];
  
  // Check for various role formats in JWT tokens
  if (decodedToken.authorities) {
    return decodedToken.authorities.map(auth => {
      if (typeof auth === 'string') return auth;
      return auth.authority || auth;
    });
  }
  
  return decodedToken.roles || 
         (decodedToken.role ? [decodedToken.role] : []) ||
         (decodedToken.authority ? [decodedToken.authority] : []);
}

/**
 * Check if the user is authenticated (has a valid token)
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
 
  // Check if token is valid
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
  return roles.some(role => {
    const roleStr = typeof role === 'string' ? role : role?.authority || '';
    return ['ADMIN', 'ROLE_ADMIN'].includes(roleStr.toUpperCase());
  });
}

/**
 * Call the backend logout API endpoint to invalidate the current token
 * @returns {Promise} Promise resolving to the API response
 */
async function callLogoutApi() {
  const token = getToken();
  if (!token) return { success: true, message: 'No token to invalidate' };

  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Logout failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Logout API call failed:', error);
    throw error;
  }
}

/**
 * Log out the current user by invalidating the token at the server
 * and removing it from local storage
 */
export async function logout() {
  try {
    // Call the backend to invalidate the token (add to blacklist)
    await callLogoutApi();
  } catch (error) {
    // Continue with client-side logout even if API call fails
    console.warn('Backend logout failed, continuing with client-side logout:', error);
  } finally {
    // Remove token from localStorage regardless of API success
    removeToken();
    
    // Redirect to login page or home page
    window.location.href = '/';
  }
}

/**
 * Get the authorization header for API requests
 * @returns {Object} Headers object with Authorization header
 */
export function getAuthHeader() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Get full authorization headers for API requests including content type
 * @returns {Object} Headers object with Authorization and Content-Type headers
 */
export function getRequestHeaders() {
  return {
    ...getAuthHeader(),
    'Content-Type': 'application/json'
  };
}

/**
 * Get current user information from the token
 * @returns {Object|null} User information or null if not authenticated
 */
export function getCurrentUser() {
  const decodedToken = decodeToken();
  if (!decodedToken) return null;
  
  return {
    email: decodedToken.sub, // In Spring Security, 'sub' claim is the username/email
    roles: getUserRoles(),
    exp: decodedToken.exp ? new Date(decodedToken.exp * 1000) : null
  };
}

/**
 * Handle API response errors related to authentication
 * @param {Response} response - Fetch API response object
 */
export function handleAuthErrors(response) {
  if (response.status === 401) {
    // Unauthorized - token expired or invalid
    console.warn('Authentication token expired or invalid');
    removeToken();
    window.location.href = '/login';
    return;
  }
  
  if (response.status === 403) {
    // Forbidden - user doesn't have permission
    console.warn('Access forbidden - insufficient permissions');
    // You could redirect to an access denied page here
  }
}

/**
 * Check if the current user has a specific role
 * @param {string} roleName - Role name to check
 * @returns {boolean} True if user has the role, false otherwise
 */
export function hasRole(roleName) {
  const roles = getUserRoles();
  const normalizedRoleName = roleName.toUpperCase();
  
  return roles.some(role => {
    const roleStr = typeof role === 'string' ? role : role?.authority || '';
    return roleStr.toUpperCase() === normalizedRoleName || 
           roleStr.toUpperCase() === `ROLE_${normalizedRoleName}`;
  });
}