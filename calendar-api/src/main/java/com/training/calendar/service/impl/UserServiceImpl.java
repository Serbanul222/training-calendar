package com.training.calendar.service.impl;

import com.training.calendar.model.Role;
import com.training.calendar.model.User;
import com.training.calendar.model.UserRole;
import com.training.calendar.model.UserRoleId;
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
import java.util.ArrayList;
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
        // CHECK 1.5: Email format check for lensa.ro domain
        if (!email.endsWith("@lensa.ro")) {
            throw new IllegalArgumentException("Email must be a lensa.ro email address");
        }
        // CHECK 2: Name empty?
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        try {
            // 1. Create the User
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .password(passwordEncoder.encode(password))
                    .firstLogin(Timestamp.from(Instant.now()))
                    .build();

            // PrePersist will set the UUID
            User savedUser = userRepository.save(newUser);

            // 2. Find or create the Role
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseGet(() -> {
                        Role newRole = Role.builder().name("ROLE_USER").build();
                        return roleRepository.save(newRole);
                    });

            // 3. Create the UserRole join record
            UserRoleId userRoleId = new UserRoleId(savedUser.getId(), userRole.getId());

            UserRole userRoleLink = UserRole.builder()
                    .id(userRoleId)
                    .user(savedUser)
                    .role(userRole)
                    .build();

            userRoleRepository.save(userRoleLink);

            return savedUser;

        } catch (Exception e) {
            System.err.println("Error in registerUser: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Transactional(readOnly = true) // Add @Transactional here to keep session open
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        List<GrantedAuthority> authorities = new ArrayList<>();

        // Eagerly load role names to avoid LazyInitializationException
        for (UserRole userRole : user.getRoles()) {
            try {
                // Access the role name within the transaction
                String roleName = userRole.getRole().getName();
                authorities.add(new SimpleGrantedAuthority(roleName));
            } catch (Exception e) {
                System.err.println("Error loading role: " + e.getMessage());
                // Default to ROLE_USER if there's an issue loading the role
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            }
        }

        // Ensure there's at least one authority
        if (authorities.isEmpty()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}