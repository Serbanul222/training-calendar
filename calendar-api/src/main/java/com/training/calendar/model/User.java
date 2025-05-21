package com.training.calendar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = "roles")  // Exclude roles from toString to prevent circular references
@EqualsAndHashCode(of = "id") // Only use id for equals/hashCode to prevent circular references
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
    private Timestamp firstLogin;

    @Column(name = "last_login")
    private Timestamp lastLogin;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
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