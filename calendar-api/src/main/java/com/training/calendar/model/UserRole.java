package com.training.calendar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRole {

    @EmbeddedId // Marks this field as an embedded composite primary key
    private UserRoleId id;

    @ManyToOne(fetch = FetchType.LAZY) // LAZY is generally better for *-to-one from a join entity
    @MapsId("userId") // Specifies that 'userId' field of UserRoleId maps to this User association
    @JoinColumn(name = "user_id") // DB column name
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("roleId") // Specifies that 'roleId' field of UserRoleId maps to this Role association
    @JoinColumn(name = "role_id") // DB column name
    private Role role;

    // The @PrePersist for a separate 'id' is no longer needed
    // as the ID is now composite and derived from User and Role.
}