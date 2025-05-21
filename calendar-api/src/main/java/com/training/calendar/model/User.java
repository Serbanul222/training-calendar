package com.training.calendar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// import java.sql.Timestamp; // Removed as it's from unstable-code
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
    private String id;

    // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
    @Column(unique = true)
    private String email;

    // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
    private String password;

    // Fields 'name', 'firstLogin', 'lastLogin' from unstable-code are removed.

    // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
    // @Builder.Default and associated comments from unstable-code are removed.
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<UserRole> roles = new ArrayList<>();

    @PrePersist
    public void onPrePersist() {
        // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}