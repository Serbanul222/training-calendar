package com.training.calendar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
@Table(name = "roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
    private String name;
}