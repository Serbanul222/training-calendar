package com.training.calendar.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantRequest {
    @NotBlank(message = "Participant email is required")
    @Email(message = "Invalid email format")
    private String participantEmail;

    private String participantName;

    @NotBlank(message = "Manager email is required")
    @Email(message = "Invalid email format")
    private String managerEmail;

    @NotBlank(message = "Location is required")
    private String location;
}