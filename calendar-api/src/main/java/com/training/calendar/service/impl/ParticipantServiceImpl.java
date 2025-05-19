package com.training.calendar.service.impl;

import com.training.calendar.dto.request.ParticipantRequest;
import com.training.calendar.dto.response.ParticipantResponse;
import com.training.calendar.exception.DuplicateRegistrationException;
import com.training.calendar.exception.EventFullException;
import com.training.calendar.exception.EventNotFoundException;
import com.training.calendar.exception.ParticipantNotFoundException;
import com.training.calendar.model.Event;
import com.training.calendar.model.Participant;
import com.training.calendar.repository.EventRepository;
import com.training.calendar.repository.ParticipantRepository;
import com.training.calendar.service.ParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParticipantServiceImpl implements ParticipantService {

    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    @Override
    @Transactional
    public ParticipantResponse registerForEvent(String eventId, ParticipantRequest request)
            throws EventNotFoundException, EventFullException, DuplicateRegistrationException {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

        // Check if event is full
        if (event.isFull()) {
            throw new EventFullException("Event is already at full capacity");
        }

        // Check if participant already registered
        if (participantRepository.existsByParticipantEmailAndEventId(request.getParticipantEmail(), eventId)) {
            throw new DuplicateRegistrationException("Participant is already registered for this event");
        }

        // Create new participant
        Participant participant = new Participant();
        participant.setParticipantEmail(request.getParticipantEmail());
        participant.setParticipantName(request.getParticipantName());
        participant.setManagerEmail(request.getManagerEmail());
        participant.setLocation(request.getLocation());
        participant.setEvent(event);

        Participant savedParticipant = participantRepository.save(participant);
        return mapToParticipantResponse(savedParticipant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipantsByEvent(String eventId) throws EventNotFoundException {
        if (!eventRepository.existsById(eventId)) {
            throw new EventNotFoundException("Event not found with id: " + eventId);
        }

        return participantRepository.findByEventId(eventId).stream()
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ParticipantResponse getParticipantById(String id) throws ParticipantNotFoundException {
        return participantRepository.findById(id)
                .map(this::mapToParticipantResponse)
                .orElseThrow(() -> new ParticipantNotFoundException("Participant not found with id: " + id));
    }

    @Override
    @Transactional
    public void removeParticipant(String participantId) throws ParticipantNotFoundException {
        if (!participantRepository.existsById(participantId)) {
            throw new ParticipantNotFoundException("Participant not found with id: " + participantId);
        }

        participantRepository.deleteById(participantId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipantsByManager(String managerEmail) {
        return participantRepository.findByManagerEmail(managerEmail).stream()
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipantsByLocation(String location) {
        return participantRepository.findByLocationContainingIgnoreCase(location).stream()
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());
    }

    // Helper method to map Participant entity to ParticipantResponse DTO
    private ParticipantResponse mapToParticipantResponse(Participant participant) {
        return ParticipantResponse.builder()
                .id(participant.getId())
                .participantEmail(participant.getParticipantEmail())
                .participantName(participant.getParticipantName())
                .managerEmail(participant.getManagerEmail())
                .location(participant.getLocation())
                .eventId(participant.getEvent().getId())
                .build();
    }
}