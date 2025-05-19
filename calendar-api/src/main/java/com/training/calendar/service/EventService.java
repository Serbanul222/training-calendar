package com.training.calendar.service;

import com.training.calendar.dto.request.EventRequest;
import com.training.calendar.dto.response.EventResponse;
import com.training.calendar.exception.EventNotFoundException;

import java.time.LocalDate;
import java.util.List;

public interface EventService {

    /**
     * Get all events
     * @return List of all events
     */
    List<EventResponse> getAllEvents();

    /**
     * Get events for a specific month and year
     * @param year Year
     * @param month Month (1-12)
     * @return List of events in the specified month
     */
    List<EventResponse> getEventsByMonth(int year, int month);

    /**
     * Get event by ID
     * @param id Event ID
     * @return Event details
     * @throws EventNotFoundException if event not found
     */
    EventResponse getEventById(String id) throws EventNotFoundException;

    /**
     * Create a new event
     * @param eventRequest Event creation request
     * @return Created event
     */
    EventResponse createEvent(EventRequest eventRequest);

    /**
     * Update an existing event
     * @param id Event ID
     * @param eventRequest Updated event data
     * @return Updated event
     * @throws EventNotFoundException if event not found
     */
    EventResponse updateEvent(String id, EventRequest eventRequest) throws EventNotFoundException;

    /**
     * Delete an event
     * @param id Event ID
     * @throws EventNotFoundException if event not found
     */
    void deleteEvent(String id) throws EventNotFoundException;

    /**
     * Check if an event has available spots
     * @param id Event ID
     * @return true if event has available spots
     * @throws EventNotFoundException if event not found
     */
    boolean hasAvailableSpots(String id) throws EventNotFoundException;

    /**
     * Get events by category
     * @param categoryId Category ID
     * @return List of events in the category
     */
    List<EventResponse> getEventsByCategory(String categoryId);

    /**
     * Get events for date range
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of events in the date range
     */
    List<EventResponse> getEventsByDateRange(LocalDate startDate, LocalDate endDate);
}