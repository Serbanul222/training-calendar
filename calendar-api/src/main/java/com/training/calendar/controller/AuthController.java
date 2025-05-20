package com.training.calendar.controller;

import com.training.calendar.dto.request.LoginRequest;
import com.training.calendar.dto.request.RegisterRequest; // Ensure this DTO has a 'name' field
import com.training.calendar.dto.response.AuthResponse;
import com.training.calendar.model.User; // Import User model
import com.training.calendar.security.JwtTokenProvider;
import com.training.calendar.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // For ResponseEntity
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
// import org.springframework.security.core.context.SecurityContextHolder; // If you want to set auth context
import org.springframework.web.bind.annotation.*;

import java.util.Map; // For error response

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Ensure RegisterRequest DTO has getName(), getEmail(), getPassword()
            User registeredUser = userService.registerUser(
                    request.getEmail(),
                    request.getName(), // <<< PASS THE NAME HERE
                    request.getPassword()
            );

            // Option A: Generate token directly after successful registration
            // The principal for token generation is typically the username/email
            String token = tokenProvider.generateToken(registeredUser.getEmail());
            return ResponseEntity.ok(new AuthResponse(token));

            // Option B: Authenticate immediately and then generate token (as you had)
            // This also serves as a check that the user was created correctly and is authenticatable.
            /*
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            // If you want to set the authentication in the security context for the current request:
            // SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = tokenProvider.generateToken(authentication.getName()); // or request.getEmail()
            return ResponseEntity.ok(new AuthResponse(token));
            */

        } catch (IllegalArgumentException e) {
            // This will catch "Email already registered" or "Name cannot be empty"
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            // Catch any other unexpected errors during registration or token generation
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected error occurred."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // This part looks fine
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        // After successful authentication, the principal's name is usually the username (email in your case)
        String token = tokenProvider.generateToken(authentication.getName());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}