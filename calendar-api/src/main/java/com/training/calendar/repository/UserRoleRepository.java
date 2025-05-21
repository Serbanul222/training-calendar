package com.training.calendar.repository;

import com.training.calendar.model.UserRole;
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
import org.springframework.data.jpa.repository.JpaRepository;

// The import for UserRoleId and @Repository annotation from unstable-code are removed.
// The generic type for JpaRepository is String as per ub30iw-codex.
public interface UserRoleRepository extends JpaRepository<UserRole, String> {
    // Comments about custom query methods from unstable-code are removed.
}