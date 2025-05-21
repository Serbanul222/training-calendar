package com.training.calendar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users") // Assumes your DB table is named "users"
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private UUID id; // App-generated via @PrePersist

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_login")
    private Timestamp firstLogin; // Mapped to first_login column

    @Column(name = "last_login")
    private Timestamp lastLogin;  // Mapped to last_login column

    // This mapping assumes UserRole has a 'user' field that maps back to this User.
    // With a composite key in UserRole, this mapping is standard.
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default // Initializes 'roles' with an empty ArrayList if not set by builder
    private List<UserRole> roles = new ArrayList<>();
    
    /**
     * Ensures the roles list is never null.
     * This prevents NullPointerException when working with the roles collection.
     * 
     * @return List of UserRole objects, never null
     */
    public List<UserRole> getRoles() {
        if (roles == null) {
            roles = new ArrayList<>();
        }
        return roles;
    }

    @PrePersist
    public void onPrePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID();
        }
    }
}