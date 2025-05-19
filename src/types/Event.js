/**
 * @typedef {Object} Event
 * @property {string} id - Unique event identifier
 * @property {string} eventDate - Date of the event (YYYY-MM-DD format)
 * @property {string} startTime - Start time of the event (HH:MM format)
 * @property {string} endTime - End time of the event (HH:MM format)
 * @property {string} categoryId - Category identifier
 * @property {string} location - Event location
 * @property {number} maxParticipants - Maximum number of participants
 * @property {string} [description] - Optional event description
 * @property {Array<Participant>} participants - List of registered participants
 * @property {number} availableSpots - Number of available spots
 * @property {boolean} isFull - Whether the event is at full capacity
 */

/**
 * @typedef {Object} EventRequest
 * @property {string} eventDate - Date of the event (YYYY-MM-DD format)
 * @property {string} startTime - Start time of the event (HH:MM format)
 * @property {string} endTime - End time of the event (HH:MM format)
 * @property {string} categoryId - Category identifier
 * @property {string} location - Event location
 * @property {number} maxParticipants - Maximum number of participants
 * @property {string} [description] - Optional event description
 */