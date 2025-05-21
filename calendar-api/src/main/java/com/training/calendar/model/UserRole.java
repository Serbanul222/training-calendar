package com.training.calendar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
import java.util.UUID;

@Entity
@Table(name = "user_roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRole {
    // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @PrePersist
    public void onPrePersist() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}