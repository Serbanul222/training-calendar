package com.training.calendar.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
public class ValidationError extends ApiError {
    private Map<String, String> fieldErrors;

    public ValidationError(HttpStatus status, String message, LocalDateTime timestamp, Map<String, String> fieldErrors) {
        super(status, message, timestamp);
        this.fieldErrors = fieldErrors;
    }
}