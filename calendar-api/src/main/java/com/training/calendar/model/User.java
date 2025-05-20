package com.training.calendar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id; // Kept from k7qgdy-codex

    @Column(unique = true)
    private String email;

    private String password;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default // Kept from k7qgdy-codex
    private List<UserRole> roles = new ArrayList<>();

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString(); // Kept from k7qgdy-codex
        }
    }
}