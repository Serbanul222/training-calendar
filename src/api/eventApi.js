import apiClient from './index';

// Helper function to add consistent logging
const logResponse = (method, endpoint, response) => {
  console.log(`API ${method} ${endpoint} success:`, response.data);
  return response.data;
};

// Helper function to handle errors
const handleError = (method, endpoint, error) => {
  console.error(`API ${method} ${endpoint} error:`, error.response?.data || error.message || error);
  throw error;
};

export default {
  getEvents() {
    console.log('API: Fetching all events');
    return apiClient.get('/events')
      .then(response => logResponse('GET', '/events', response))
      .catch(error => handleError('GET', '/events', error));
  },

  getEventsByMonth(year, month) {
    const endpoint = `/events/month?year=${year}&month=${month}`;
    console.log(`API: Fetching events for ${year}/${month}`);
    return apiClient.get(endpoint)
      .then(response => logResponse('GET', endpoint, response))
      .catch(error => handleError('GET', endpoint, error));
  },

  getEvent(id) {
    const endpoint = `/events/${id}`;
    console.log(`API: Fetching event ${id}`);
    return apiClient.get(endpoint)
      .then(response => logResponse('GET', endpoint, response))
      .catch(error => handleError('GET', endpoint, error));
  },

  createEvent(event) {
    console.log('API: Creating event', event);
    return apiClient.post('/events', event)
      .then(response => logResponse('POST', '/events', response))
      .catch(error => handleError('POST', '/events', error));
  },

  updateEvent(id, event) {
    const endpoint = `/events/${id}`;
    console.log(`API: Updating event ${id}`, event);
    return apiClient.put(endpoint, event)
      .then(response => logResponse('PUT', endpoint, response))
      .catch(error => handleError('PUT', endpoint, error));
  },

  deleteEvent(id) {
    const endpoint = `/events/${id}`;
    console.log(`API: Deleting event ${id}`);
    return apiClient.delete(endpoint)
      .then(response => {
        console.log(`API DELETE ${endpoint} success`);
        return response;
      })
      .catch(error => handleError('DELETE', endpoint, error));
  },

  getEventsByCategory(categoryId) {
    const endpoint = `/events/category/${categoryId}`;
    console.log(`API: Fetching events for category ${categoryId}`);
    return apiClient.get(endpoint)
      .then(response => logResponse('GET', endpoint, response))
      .catch(error => handleError('GET', endpoint, error));
  },

  checkEventAvailability(id) {
    const endpoint = `/events/${id}/available`;
    console.log(`API: Checking availability for event ${id}`);
    return apiClient.get(endpoint)
      .then(response => logResponse('GET', endpoint, response))
      .catch(error => handleError('GET', endpoint, error));
  }
};