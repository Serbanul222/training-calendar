package com.training.calendar.service;

import com.training.calendar.model.User;
import org.springframework.security.core.userdetails.UserDetailsService; // Keep this if UserServiceImpl implements it for Spring Security

import java.util.Optional;

public interface UserService extends UserDetailsService { // Ensure UserServiceImpl correctly implements loadUserByUsername

    // Updated method signature to include 'name'
    User registerUser(String email, String name, String password);

    Optional<User> findByEmail(String email);

    // The method 'UserDetails loadUserByUsername(String username)'
    // is inherited from UserDetailsService and should be implemented by UserServiceImpl.
}