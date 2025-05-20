package com.training.calendar.service;

import com.training.calendar.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Optional;

public interface UserService extends UserDetailsService {
    User registerUser(String email, String password);
    Optional<User> findByEmail(String email);
}
