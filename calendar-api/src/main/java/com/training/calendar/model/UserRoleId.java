package com.training.calendar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode // Crucial for composite keys
public class UserRoleId implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L; // Good practice

    @Column(name = "user_id") // Matches the column name in user_roles table
    private UUID userId;

    @Column(name = "role_id") // Matches the column name in user_roles table
    private Integer roleId;   // Matches the type of Role.id
}
