// src/main/java/com/training/calendar/exception/TimeConflictException.java
package com.training.calendar.exception;

public class TimeConflictException extends RuntimeException {
    public TimeConflictException(String message) {
        super(message);
    }
}