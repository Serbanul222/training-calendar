package com.training.calendar.repository;

import com.training.calendar.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {

    // Find events in a specific month and year
    @Query("SELECT e FROM Event e WHERE YEAR(e.eventDate) = :year AND MONTH(e.eventDate) = :month")
    List<Event> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Find events by category
    List<Event> findByCategoryId(String categoryId);

    // Find events by date range
    List<Event> findByEventDateBetween(LocalDate startDate, LocalDate endDate);

    // Find events by location
    List<Event> findByLocationContainingIgnoreCase(String location);

    // Check if an event has available spots
    @Query("SELECT CASE WHEN COUNT(p) < e.maxParticipants THEN true ELSE false END FROM Event e LEFT JOIN e.participants p WHERE e.id = :eventId GROUP BY e.id, e.maxParticipants")
    Boolean hasAvailableSpots(@Param("eventId") String eventId);

    @Query("SELECT e FROM Event e WHERE e.eventDate = :date AND " +
            "((e.startTime <= :endTime AND e.endTime >= :startTime))")
    List<Event> findOverlappingEvents(
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    // Find events for a specific day
    List<Event> findByEventDateOrderByStartTime(LocalDate date);

    // Count events by category
    Long countByCategoryId(String categoryId);
}