package com.training.calendar.repository;

import com.training.calendar.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(String name);
}