package com.training.calendar.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {
    @NotNull(message = "Event date is required")
    private LocalDate eventDate;

    @NotBlank(message = "Category ID is required")
    private String categoryId;

    @NotBlank(message = "Location is required")
    private String location;

    @Min(value = 1, message = "Maximum participants must be at least 1")
    private int maxParticipants;

    private String description;
}