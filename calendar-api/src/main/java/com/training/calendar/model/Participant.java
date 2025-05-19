package com.training.calendar.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Entity
@Table(name = "participants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Participant {

    @Id
    private String id;

    @NotBlank
    @Email
    private String participantEmail;

    private String participantName;

    @NotBlank
    @Email
    private String managerEmail;

    @NotBlank
    private String location;

    @ManyToOne
    @JoinColumn(name = "event_id")
    @NotNull
    private Event event;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}