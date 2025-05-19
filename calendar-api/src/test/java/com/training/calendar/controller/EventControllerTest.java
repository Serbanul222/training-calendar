package com.training.calendar.controller;

import com.training.calendar.dto.request.EventRequest;
import com.training.calendar.dto.response.EventResponse;
import com.training.calendar.service.EventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime; // Add this import
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EventController.class)
public class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    private EventResponse sampleEvent;
    private List<EventResponse> eventList;

    @BeforeEach
    void setUp() {
        sampleEvent = EventResponse.builder()
                .id("1")
                .eventDate(LocalDate.now())
                .startTime(LocalTime.of(9, 0)) // Add start time: 9:00 AM
                .endTime(LocalTime.of(17, 0))  // Add end time: 5:00 PM
                .categoryId("CONSULTANTA")
                .location("București")
                .maxParticipants(10)
                .participants(List.of())
                .availableSpots(10)
                .isFull(false)
                .build();

        eventList = Arrays.asList(sampleEvent);
    }

    @Test
    void getAllEventsShouldReturnEvents() throws Exception {
        when(eventService.getAllEvents()).thenReturn(eventList);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("1")))
                .andExpect(jsonPath("$[0].location", is("București")));
    }

    @Test
    void getEventByIdShouldReturnEvent() throws Exception {
        when(eventService.getEventById("1")).thenReturn(sampleEvent);

        mockMvc.perform(get("/api/events/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("1")))
                .andExpect(jsonPath("$.categoryId", is("CONSULTANTA")));
    }

    @Test
    void createEventShouldReturnCreatedEvent() throws Exception {
        EventRequest eventRequest = new EventRequest(
                LocalDate.now(),
                LocalTime.of(9, 0),  // Start time: 9:00 AM
                LocalTime.of(17, 0), // End time: 5:00 PM
                "CONSULTANTA",
                "București",
                10,
                "Description"
        );

        when(eventService.createEvent(any(EventRequest.class))).thenReturn(sampleEvent);

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"eventDate\": \"" + LocalDate.now() + "\", \"startTime\": \"09:00\", \"endTime\": \"17:00\", \"categoryId\": \"CONSULTANTA\", \"location\": \"București\", \"maxParticipants\": 10, \"description\": \"Description\" }"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("1")));
    }

    @Test
    void updateEventShouldReturnUpdatedEvent() throws Exception {
        EventRequest eventRequest = new EventRequest(
                LocalDate.now(),
                LocalTime.of(10, 0),  // Updated start time: 10:00 AM
                LocalTime.of(16, 0),  // Updated end time: 4:00 PM
                "CONSULTANTA",
                "Cluj",
                15,
                "Updated description"
        );

        EventResponse updatedEvent = EventResponse.builder()
                .id("1")
                .eventDate(LocalDate.now())
                .startTime(LocalTime.of(10, 0))  // Updated start time
                .endTime(LocalTime.of(16, 0))    // Updated end time
                .categoryId("CONSULTANTA")
                .location("Cluj")
                .maxParticipants(15)
                .description("Updated description")
                .participants(List.of())
                .availableSpots(15)
                .isFull(false)
                .build();

        when(eventService.updateEvent(eq("1"), any(EventRequest.class))).thenReturn(updatedEvent);

        mockMvc.perform(put("/api/events/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"eventDate\": \"" + LocalDate.now() + "\", \"startTime\": \"10:00\", \"endTime\": \"16:00\", \"categoryId\": \"CONSULTANTA\", \"location\": \"Cluj\", \"maxParticipants\": 15, \"description\": \"Updated description\" }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("1")))
                .andExpect(jsonPath("$.location", is("Cluj")))
                .andExpect(jsonPath("$.maxParticipants", is(15)));
    }

    @Test
    void deleteEventShouldReturn204() throws Exception {
        mockMvc.perform(delete("/api/events/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void checkTimeConflictShouldReturnBoolean() throws Exception {
        when(eventService.hasTimeConflict(any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), any())).thenReturn(false);

        mockMvc.perform(get("/api/events/check-conflict")
                        .param("date", LocalDate.now().toString())
                        .param("startTime", "09:00")
                        .param("endTime", "17:00"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    void getEventsByDayShouldReturnEvents() throws Exception {
        when(eventService.getEventsByDay(any(LocalDate.class))).thenReturn(eventList);

        mockMvc.perform(get("/api/events/day")
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is("1")));
    }
}