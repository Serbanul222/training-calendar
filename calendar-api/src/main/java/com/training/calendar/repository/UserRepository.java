package com.training.calendar.repository;

import com.training.calendar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
// Both versions are identical here, so no conflict to resolve.
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
}