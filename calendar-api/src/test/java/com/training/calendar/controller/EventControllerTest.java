package com.training.calendar.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.training.calendar.dto.request.EventRequest;
import com.training.calendar.dto.response.EventResponse;
import com.training.calendar.service.EventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class) // Assuming your controller is named EventController
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    @Autowired
    private WebApplicationContext context;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // This is important if you're testing with Spring Security and custom filters
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity()) // Apply Spring Security configuration for tests
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // To handle LocalDate/LocalTime serialization
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"}) // Assuming ADMIN role is needed for creation
    void createEvent_whenValidRequest_shouldReturnCreatedEvent() throws Exception {
        // This might be where line 79 was, constructing EventRequest
        EventRequest eventRequest = EventRequest.builder()
                .name("Annual Tech Conference")
                .eventDate(LocalDate.of(2025, 10, 15))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(17, 0))
                .categoryId("TECH")
                .location("Main Auditorium")
                .maxParticipants(200)
                .description("A conference about new technologies.")
                .build();

        EventResponse eventResponse = EventResponse.builder()
                .id("event123")
                .name("Annual Tech Conference")
                .eventDate(LocalDate.of(2025, 10, 15))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(17, 0))
                .categoryId("TECH")
                .location("Main Auditorium")
                .maxParticipants(200)
                .description("A conference about new technologies.")
                .participants(Collections.emptyList()) // Example
                .availableSpots(200)
                .isFull(false)
                .build();

        given(eventService.createEvent(any(EventRequest.class))).willReturn(eventResponse);

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(eventRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("event123"))
                .andExpect(jsonPath("$.name").value("Annual Tech Conference"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"}) // Assuming ADMIN role is needed for update
    void updateEvent_whenValidRequest_shouldReturnUpdatedEvent() throws Exception {
        String eventId = "event123";
        // This might be where line 100 was, constructing EventRequest for an update
        EventRequest eventRequestToUpdate = EventRequest.builder()
                .name("Updated Tech Conference")
                .eventDate(LocalDate.of(2025, 10, 16)) // e.g., date changed
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(18, 0))
                .categoryId("TECH_UPDATED")
                .location("New Auditorium")
                .maxParticipants(250)
                .description("Updated conference details.")
                .build();

        EventResponse updatedEventResponse = EventResponse.builder()
                .id(eventId)
                .name("Updated Tech Conference")
                .eventDate(LocalDate.of(2025, 10, 16))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(18, 0))
                .categoryId("TECH_UPDATED")
                .location("New Auditorium")
                .maxParticipants(250)
                .description("Updated conference details.")
                .participants(Collections.emptyList())
                .availableSpots(250)
                .isFull(false)
                .build();

        given(eventService.updateEvent(eq(eventId), any(EventRequest.class))).willReturn(updatedEventResponse);

        mockMvc.perform(put("/api/events/{id}", eventId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(eventRequestToUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(eventId))
                .andExpect(jsonPath("$.name").value("Updated Tech Conference"))
                .andExpect(jsonPath("$.location").value("New Auditorium"));
    }

    @Test
        // No @WithMockUser here if GET /api/events is public as per SecurityConfig
    void getAllEvents_shouldReturnListOfEvents() throws Exception {
        EventResponse event1 = EventResponse.builder().id("1").name("Event 1").build();
        EventResponse event2 = EventResponse.builder().id("2").name("Event 2").build();
        List<EventResponse> allEvents = List.of(event1, event2);

        given(eventService.getAllEvents()).willReturn(allEvents);

        mockMvc.perform(get("/api/events")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].name").value("Event 1"));
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"}) // Or whatever role can delete, or admin
    void deleteEvent_whenEventExists_shouldReturnNoContent() throws Exception {
        String eventId = "eventToDelete";

        // Mock the service method for delete. It usually returns void.
        doNothing().when(eventService).deleteEvent(eventId);

        mockMvc.perform(delete("/api/events/{id}", eventId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent()); // Or .isOk() if your controller returns that
    }

    // Add more tests for:
    // - getEventById
    // - getEventsByMonth
    // - getEventsByDay
    // - Error cases (e.g., validation errors, event not found, time conflicts)
    // - Unauthorized access attempts

}