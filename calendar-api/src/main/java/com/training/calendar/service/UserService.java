package com.training.calendar.service;

import com.training.calendar.model.User;
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
// The import for UserDetailsService is common to both, the comment from unstable-code is not kept.
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Optional;

// The interface declaration `extends UserDetailsService` is common.
public interface UserService extends UserDetailsService {
    // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
    // The method signature `registerUser(String email, String password)` is kept.
    // The version from unstable-code that included `name` is discarded.
    User registerUser(String email, String password);
    Optional<User> findByEmail(String email);
    // Comments from unstable-code regarding loadUserByUsername are not kept.
}