package com.training.calendar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles") // Ensure your table is named 'roles'
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // For auto-incrementing integer IDs
    private Integer id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "ROLE_USER", "ROLE_ADMIN"
}