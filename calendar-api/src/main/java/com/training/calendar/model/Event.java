// src/main/java/com/training/calendar/model/Event.java
package com.training.calendar.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;  // Add this import
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    private String id;

    @NotBlank
    private String name;

    @NotNull
    private LocalDate eventDate;

    // Add start and end time fields
    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotBlank
    @Column(name = "category_id")
    private String categoryId;

    @NotBlank
    private String location;

    @Min(1)
    private int maxParticipants;

    private String description;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Participant> participants = new ArrayList<>();

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            this.id = UUID.randomUUID().toString();
        }

        // Set default times if they are null
        if (startTime == null) {
            this.startTime = LocalTime.of(9, 0); // Default to 9:00 AM
        }

        if (endTime == null) {
            this.endTime = LocalTime.of(17, 0); // Default to 5:00 PM
        }
    }

    public boolean isFull() {
        return participants.size() >= maxParticipants;
    }

    public int getAvailableSpots() {
        return maxParticipants - participants.size();
    }
}