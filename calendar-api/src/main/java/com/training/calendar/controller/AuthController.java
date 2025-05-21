package com.training.calendar.controller;

import com.training.calendar.dto.request.LoginRequest;
import com.training.calendar.dto.request.RegisterRequest;
import com.training.calendar.dto.response.AuthResponse;
import com.training.calendar.model.User;
import com.training.calendar.security.JwtTokenProvider;
import com.training.calendar.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
            User registeredUser = userService.registerUser(
                    request.getEmail(),
                    request.getName(),
                    request.getPassword()
            );

            String token = tokenProvider.generateToken(registeredUser.getEmail());
            return ResponseEntity.ok(new AuthResponse(token));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected error occurred."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        String token = tokenProvider.generateToken(authentication.getName());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    /**
     * Logout endpoint to invalidate the current JWT token
     * @param authHeader The Authorization header containing the JWT token
     * @return ResponseEntity with HTTP status
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Check if Authorization header exists and starts with "Bearer "
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                // Extract the token from the Authorization header
                String token = authHeader.substring(7);

                // Add the token to the blacklist
                tokenProvider.blacklistToken(token);

                return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
            }

            // If no valid token was provided, still return success but with a different message
            return ResponseEntity.ok(Map.of("message", "No active session to logout"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Logout failed: " + e.getMessage()));
        }
    }
}