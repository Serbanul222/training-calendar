package com.training.calendar.controller;

import com.training.calendar.dto.request.EventRequest;
import com.training.calendar.dto.response.EventResponse;
import com.training.calendar.exception.TimeConflictException;
import com.training.calendar.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/month")
    public ResponseEntity<List<EventResponse>> getEventsByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(eventService.getEventsByMonth(year, month));
    }

    @GetMapping("/day")
    public ResponseEntity<List<EventResponse>> getEventsByDay(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(eventService.getEventsByDay(date));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<EventResponse>> getEventsByCategory(@PathVariable String categoryId) {
        return ResponseEntity.ok(eventService.getEventsByCategory(categoryId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<EventResponse>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(eventService.getEventsByDateRange(startDate, endDate));
    }

    @GetMapping("/{id}/available")
    public ResponseEntity<Boolean> checkEventAvailability(@PathVariable String id) {
        return ResponseEntity.ok(eventService.hasAvailableSpots(id));
    }
    @GetMapping("/check-conflict")
    public ResponseEntity<Boolean> checkTimeConflict(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date, // <<<< IMPORTANT
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(required = false) String excludeEventId) {

        boolean hasConflict = eventService.hasTimeConflict(date, startTime, endTime, excludeEventId);
        return ResponseEntity.ok(hasConflict);
    }


    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest eventRequest) {
        try {
            EventResponse createdEvent = eventService.createEvent(eventRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
        } catch (TimeConflictException e) {
            // You could also handle this in the GlobalExceptionHandler
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable String id,
            @Valid @RequestBody EventRequest eventRequest) {
        try {
            return ResponseEntity.ok(eventService.updateEvent(id, eventRequest));
        } catch (TimeConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}