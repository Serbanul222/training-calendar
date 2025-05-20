import apiClient from './index'; // Ensure this path correctly points to your configured API client (e.g., Axios instance)

export default {
  /**
   * Registers a new user.
   * @param {object} userData - The user data for registration.
   * @param {string} userData.name - The user's full name.
   * @param {string} userData.email - The user's email address.
   * @param {string} userData.password - The user's password.
   * @returns {Promise<object>} A promise that resolves with the response data (e.g., { token: '...' }).
   */
  register(userData) {
    return apiClient.post('/auth/register', userData)
      .then(res => res.data);
  },

  /**
   * Logs in an existing user.
   * @param {object} credentials - The user's login credentials.
   * @param {string} credentials.email - The user's email address.
   * @param {string} credentials.password - The user's password.
   * @returns {Promise<object>} A promise that resolves with the response data (e.g., { token: '...' }).
   */
  login(credentials) { // Changed login to also accept an object for consistency
    return apiClient.post('/auth/login', credentials)
      .then(res => res.data);
  }
};