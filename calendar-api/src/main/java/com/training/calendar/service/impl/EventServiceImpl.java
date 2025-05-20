package com.training.calendar.service.impl;

import com.training.calendar.dto.request.EventRequest;
import com.training.calendar.dto.response.EventResponse;
import com.training.calendar.dto.response.ParticipantResponse;
import com.training.calendar.exception.CategoryNotFoundException;
import com.training.calendar.exception.EventNotFoundException;
import com.training.calendar.exception.TimeConflictException;
import com.training.calendar.model.Event;
import com.training.calendar.model.Participant;
import com.training.calendar.repository.CategoryRepository;
import com.training.calendar.repository.EventRepository;
import com.training.calendar.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByMonth(int year, int month) {
        return eventRepository.findByYearAndMonth(year, month).stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByDay(LocalDate date) {
        return eventRepository.findByEventDateOrderByStartTime(date).stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEventById(String id) throws EventNotFoundException {
        return eventRepository.findById(id)
                .map(this::mapToEventResponse)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));
    }

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest eventRequest) {
        // Validate that category exists if provided (from 9nz1zf-codex)
        if (eventRequest.getCategoryId() != null && !eventRequest.getCategoryId().isEmpty()) {
            if (!categoryRepository.existsById(eventRequest.getCategoryId())) {
                throw new CategoryNotFoundException("Category not found with id: " + eventRequest.getCategoryId());
            }
        }
        // Note: The 'else { eventRequest.setCategoryId(null); }' from 'unstable-code' is NOT kept,
        // as per the strategy to prioritize 9nz1zf-codex which doesn't have this else block.
        // If categoryId is empty, it will be saved as such. If it's null, it's already null.

        // Validate times
        if (eventRequest.getEndTime().isBefore(eventRequest.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for time conflicts
        if (hasTimeConflict(eventRequest.getEventDate(), eventRequest.getStartTime(),
                eventRequest.getEndTime(), null)) {
            throw new TimeConflictException("Event time conflicts with an existing event");
        }

        Event event = new Event();
        event.setName(eventRequest.getName());
        event.setEventDate(eventRequest.getEventDate());
        event.setStartTime(eventRequest.getStartTime());
        event.setEndTime(eventRequest.getEndTime());
        event.setCategoryId(eventRequest.getCategoryId());
        event.setLocation(eventRequest.getLocation());
        event.setMaxParticipants(eventRequest.getMaxParticipants());
        event.setDescription(eventRequest.getDescription());

        Event savedEvent = eventRepository.save(event);
        return mapToEventResponse(savedEvent);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(String id, EventRequest eventRequest) throws EventNotFoundException {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));

        // Validate that category exists if provided (from 9nz1zf-codex)
        if (eventRequest.getCategoryId() != null && !eventRequest.getCategoryId().isEmpty()) {
            if (!categoryRepository.existsById(eventRequest.getCategoryId())) {
                throw new CategoryNotFoundException("Category not found with id: " + eventRequest.getCategoryId());
            }
        }
        // Note: The 'else { eventRequest.setCategoryId(null); }' from 'unstable-code' is NOT kept.

        // Validate times
        if (eventRequest.getEndTime().isBefore(eventRequest.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for time conflicts (excluding this event)
        if (hasTimeConflict(eventRequest.getEventDate(), eventRequest.getStartTime(),
                eventRequest.getEndTime(), id)) {
            throw new TimeConflictException("Event time conflicts with an existing event");
        }

        // Update event properties
        event.setName(eventRequest.getName());
        event.setEventDate(eventRequest.getEventDate());
        event.setStartTime(eventRequest.getStartTime());
        event.setEndTime(eventRequest.getEndTime());
        event.setCategoryId(eventRequest.getCategoryId());
        // event.setName(eventRequest.getName()); // Duplicate assignment, removed one
        event.setLocation(eventRequest.getLocation());
        event.setMaxParticipants(eventRequest.getMaxParticipants());
        event.setDescription(eventRequest.getDescription());

        Event updatedEvent = eventRepository.save(event);
        return mapToEventResponse(updatedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(String id) throws EventNotFoundException {
        if (!eventRepository.existsById(id)) {
            throw new EventNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAvailableSpots(String id) throws EventNotFoundException {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));

        return !event.isFull();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByCategory(String categoryId) {
        return eventRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getEventsByDateRange(LocalDate startDate, LocalDate endDate) {
        return eventRepository.findByEventDateBetween(startDate, endDate).stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasTimeConflict(LocalDate eventDate, LocalTime startTime, LocalTime endTime, String excludeEventId) {
        List<Event> overlappingEvents = eventRepository.findOverlappingEvents(eventDate, startTime, endTime);

        // If we're updating an existing event, exclude it from the conflict check
        if (excludeEventId != null) {
            overlappingEvents = overlappingEvents.stream()
                    .filter(event -> !event.getId().equals(excludeEventId))
                    .collect(Collectors.toList());
        }

        return !overlappingEvents.isEmpty();
    }

    // Helper method to map Event entity to EventResponse DTO
    private EventResponse mapToEventResponse(Event event) {
        List<ParticipantResponse> participants = event.getParticipants().stream()
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());

        return EventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .eventDate(event.getEventDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .categoryId(event.getCategoryId())
                // .name(event.getName()) // Duplicate assignment in builder, removed one
                .location(event.getLocation())
                .maxParticipants(event.getMaxParticipants())
                .description(event.getDescription())
                .participants(participants)
                .availableSpots(event.getAvailableSpots())
                .isFull(event.isFull())
                .build();
    }

    // Helper method to map Participant entity to ParticipantResponse DTO
    private ParticipantResponse mapToParticipantResponse(Participant participant) {
        return ParticipantResponse.builder()
                .id(participant.getId())
                .participantEmail(participant.getParticipantEmail())
                .participantName(participant.getParticipantName())
                .managerEmail(participant.getManagerEmail())
                .location(participant.getLocation())
                .build();
    }
}