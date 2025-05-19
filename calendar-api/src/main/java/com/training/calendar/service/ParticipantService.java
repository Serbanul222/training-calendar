package com.training.calendar.service;

import com.training.calendar.dto.request.ParticipantRequest;
import com.training.calendar.dto.response.ParticipantResponse;
import com.training.calendar.exception.DuplicateRegistrationException;
import com.training.calendar.exception.EventFullException;
import com.training.calendar.exception.EventNotFoundException;
import com.training.calendar.exception.ParticipantNotFoundException;

import java.util.List;

public interface ParticipantService {

    /**
     * Register a participant for an event
     * @param eventId Event ID
     * @param request Participant registration request
     * @return Registered participant
     * @throws EventNotFoundException if event not found
     * @throws EventFullException if event is already full
     * @throws DuplicateRegistrationException if participant already registered
     */
    ParticipantResponse registerForEvent(String eventId, ParticipantRequest request)
            throws EventNotFoundException, EventFullException, DuplicateRegistrationException;

    /**
     * Get all participants for an event
     * @param eventId Event ID
     * @return List of participants
     * @throws EventNotFoundException if event not found
     */
    List<ParticipantResponse> getParticipantsByEvent(String eventId) throws EventNotFoundException;

    /**
     * Get participant by ID
     * @param id Participant ID
     * @return Participant details
     * @throws ParticipantNotFoundException if participant not found
     */
    ParticipantResponse getParticipantById(String id) throws ParticipantNotFoundException;

    /**
     * Remove a participant from an event
     * @param participantId Participant ID
     * @throws ParticipantNotFoundException if participant not found
     */
    void removeParticipant(String participantId) throws ParticipantNotFoundException;

    /**
     * Get participants by manager email
     * @param managerEmail Manager's email
     * @return List of participants managed by the manager
     */
    List<ParticipantResponse> getParticipantsByManager(String managerEmail);

    /**
     * Get participants by store location
     * @param location Store location
     * @return List of participants from the location
     */
    List<ParticipantResponse> getParticipantsByLocation(String location);
}