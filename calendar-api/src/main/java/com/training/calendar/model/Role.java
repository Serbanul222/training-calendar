package com.training.calendar.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "roles")
@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "ROLE_USER", "ROLE_ADMIN"

    // If you want to add a back-reference to UserRole entities (optional)
    // @OneToMany(mappedBy = "role")
    // @ToString.Exclude  // Exclude from toString to prevent circular references
    // private List<UserRole> userRoles;
}