import { ref } from 'vue';
import participantApi from '@/api/participantApi';

export default function useRegistration() {
  const participants = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Register a participant for an event
  const registerForEvent = async (eventId, participantData) => {
    loading.value = true;
    error.value = null;
    
    try {
      const newParticipant = await participantApi.registerForEvent(eventId, participantData);
      return newParticipant;
    } catch (err) {
      // Handle different error types
      if (err.response?.status === 409) {
        error.value = 'You are already registered for this event';
      } else if (err.response?.status === 400) {
        error.value = 'Event is already full';
      } else {
        error.value = 'Failed to register for event';
      }
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Get all participants for an event
  const getParticipantsByEvent = async (eventId) => {
    loading.value = true;
    error.value = null;
    
    try {
      participants.value = await participantApi.getParticipantsByEvent(eventId);
      return participants.value;
    } catch (err) {
      error.value = 'Failed to load participants';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Remove a participant
  const removeParticipant = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      await participantApi.removeParticipant(id);
      participants.value = participants.value.filter(p => p.id !== id);
    } catch (err) {
      error.value = 'Failed to remove participant';
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    participants,
    loading,
    error,
    registerForEvent,
    getParticipantsByEvent,
    removeParticipant
  };
}