package com.training.calendar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantResponse {
    private String id;
    private String participantEmail;
    private String participantName;
    private String managerEmail;
    private String location;
    private String eventId;
}