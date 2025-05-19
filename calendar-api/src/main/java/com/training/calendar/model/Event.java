package com.training.calendar.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
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

    @NotNull
    private LocalDate eventDate;

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
    }

    public boolean isFull() {
        return participants.size() >= maxParticipants;
    }

    public int getAvailableSpots() {
        return maxParticipants - participants.size();
    }
}