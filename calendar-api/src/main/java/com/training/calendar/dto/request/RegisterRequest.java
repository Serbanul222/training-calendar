package com.training.calendar.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String password;
    // The 'name' field and its validation from 'unstable-code' are removed
    // because we are keeping the version from 'ub30iw-codex/implement-user-authentication-and-role-management'
}