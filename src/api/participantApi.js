import apiClient from './index';

export default {
  registerForEvent(eventId, participant) {
    return apiClient.post(`/participants/event/${eventId}/register`, participant)
      .then(response => response.data);
  },

  getParticipantsByEvent(eventId) {
    return apiClient.get(`/participants/event/${eventId}`)
      .then(response => response.data);
  },

  getParticipant(id) {
    return apiClient.get(`/participants/${id}`)
      .then(response => response.data);
  },

  removeParticipant(id) {
    return apiClient.delete(`/participants/${id}`);
  }
};