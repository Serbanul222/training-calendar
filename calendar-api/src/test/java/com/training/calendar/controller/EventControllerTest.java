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
                LocalDate.now(), "CONSULTANTA", "București", 10, "Description"
        );

        when(eventService.createEvent(any(EventRequest.class))).thenReturn(sampleEvent);

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"eventDate\": \"" + LocalDate.now() + "\", \"categoryId\": \"CONSULTANTA\", \"location\": \"București\", \"maxParticipants\": 10, \"description\": \"Description\" }"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("1")));
    }

    @Test
    void updateEventShouldReturnUpdatedEvent() throws Exception {
        EventRequest eventRequest = new EventRequest(
                LocalDate.now(), "CONSULTANTA", "Cluj", 15, "Updated description"
        );

        EventResponse updatedEvent = EventResponse.builder()
                .id("1")
                .eventDate(LocalDate.now())
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
                        .content("{ \"eventDate\": \"" + LocalDate.now() + "\", \"categoryId\": \"CONSULTANTA\", \"location\": \"Cluj\", \"maxParticipants\": 15, \"description\": \"Updated description\" }"))
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
}