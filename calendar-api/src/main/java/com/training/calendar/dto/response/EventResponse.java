// src/main/java/com/training/calendar/dto/response/EventResponse.java
package com.training.calendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private String id;
    private String name;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String categoryId;
    private String name;
    private String location;
    private int maxParticipants;
    private String description;
    private List<ParticipantResponse> participants;
    private int availableSpots;
    private boolean isFull;
}