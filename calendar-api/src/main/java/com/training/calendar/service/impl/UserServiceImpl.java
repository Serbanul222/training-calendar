package com.training.calendar.service.impl;

import com.training.calendar.model.Role;
import com.training.calendar.model.User;
import com.training.calendar.model.UserRole;
import com.training.calendar.model.UserRoleId; // Import the composite key class
import com.training.calendar.repository.RoleRepository;
import com.training.calendar.repository.UserRepository;
import com.training.calendar.repository.UserRoleRepository;
import com.training.calendar.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User registerUser(String email, String name, String password) {
        // CHECK 1: Email already registered?
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        // CHECK 2: Name empty?
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        // 1. Prepare the User entity
        User newUser = User.builder()
                .email(email)
                .name(name)
                .password(passwordEncoder.encode(password))
                .firstLogin(Timestamp.from(Instant.now()))
                // .lastLogin(Timestamp.from(Instant.now()))
                .build();
        // @PrePersist in User.java will set its UUID id

        // 2. Save the User entity
        User savedUser = userRepository.save(newUser);

        // 3. Find or create the Role
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role newRole = Role.builder().name("ROLE_USER").build();
                    // Assuming Role.id is Integer and auto-generated (IDENTITY strategy)
                    return roleRepository.save(newRole);
                });

        // 4. Create the composite ID for UserRole
        // Potential NullPointerException here if savedUser.getId() or userRole.getId() is null
        // savedUser.getId() should be populated by @PrePersist before save, or by DB after save if DB generated.
        // userRole.getId() should be populated by DB after roleRepository.save(newRole).
        UserRoleId userRoleId = new UserRoleId(savedUser.getId(), userRole.getId());

        // 5. Create and save the UserRole (join table entry)
        UserRole userRoleLink = UserRole.builder()
                .id(userRoleId)
                .user(savedUser)
                .role(userRole)
                .build();
        userRoleRepository.save(userRoleLink);

        // 6. Add the UserRoleLink to the savedUser's collection
        savedUser.getRoles().add(userRoleLink);

        return savedUser;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(ur -> new SimpleGrantedAuthority(ur.getRole().getName()))
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}