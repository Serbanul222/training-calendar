package com.training.calendar.repository;

import com.training.calendar.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, String> {

    // Find all participants for a specific event
    List<Participant> findByEventId(String eventId);

    // Check if a participant is already registered for an event
    boolean existsByParticipantEmailAndEventId(String participantEmail, String eventId);

    // Find participant by email and event
    Optional<Participant> findByParticipantEmailAndEventId(String participantEmail, String eventId);

    // Find participants by manager
    List<Participant> findByManagerEmail(String managerEmail);

    // Find participants by store location
    List<Participant> findByLocationContainingIgnoreCase(String location);

    // Count participants for an event
    @Query("SELECT COUNT(p) FROM Participant p WHERE p.event.id = :eventId")
    Long countByEventId(@Param("eventId") String eventId);
}