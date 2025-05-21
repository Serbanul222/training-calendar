package com.training.calendar.controller;

import com.training.calendar.dto.request.LoginRequest;
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
import com.training.calendar.dto.request.RegisterRequest;
import com.training.calendar.dto.response.AuthResponse;
// Imports from unstable-code like User model and HttpStatus are removed as per the choice.
import com.training.calendar.security.JwtTokenProvider;
import com.training.calendar.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
// HttpStatus import removed from here
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
// Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
import org.springframework.web.bind.annotation.*;
// Commented out SecurityContextHolder and Map import removed from here

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        userService.registerUser(request.getEmail(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String token = tokenProvider.generateToken(authentication.getName());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // Kept from <<<<<<< ub30iw-codex/implement-user-authentication-and-role-management
        // (The functional code was identical, only comments differed, keeping the cleaner version)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String token = tokenProvider.generateToken(authentication.getName());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}