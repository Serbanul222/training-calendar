// EventTest.java
package com.training.calendar.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.ArrayList;

class EventTest {

    @Test
    void testEventIsFull() {
        // Given
        Event event = Event.builder()
                .id("1")
                .eventDate(LocalDate.now())
                .categoryId("CONSULTANTA")
                .location("Bucharest")
                .maxParticipants(2)
                .description("Test event")
                .participants(new ArrayList<>())
                .build();

        Participant participant1 = Participant.builder()
                .id("p1")
                .participantEmail("user1@example.com")
                .managerEmail("manager@example.com")
                .location("Store 1")
                .event(event)
                .build();

        // When
        event.getParticipants().add(participant1);

        // Then
        assertFalse(event.isFull());
        assertEquals(1, event.getAvailableSpots());

        // When adding a second participant
        Participant participant2 = Participant.builder()
                .id("p2")
                .participantEmail("user2@example.com")
                .managerEmail("manager@example.com")
                .location("Store 2")
                .event(event)
                .build();

        event.getParticipants().add(participant2);

        // Then
        assertTrue(event.isFull());
        assertEquals(0, event.getAvailableSpots());
    }

    @Test
    void testPrePersistGeneratesId() {
        // Given
        Event event = new Event();

        // When
        event.onPrePersist();

        // Then
        assertNotNull(event.getId());
    }
}