package com.training.calendar.controller;

import com.training.calendar.dto.request.ParticipantRequest;
import com.training.calendar.dto.response.ParticipantResponse;
import com.training.calendar.service.ParticipantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @GetMapping("/{id}")
    public ResponseEntity<ParticipantResponse> getParticipantById(@PathVariable String id) {
        return ResponseEntity.ok(participantService.getParticipantById(id));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<ParticipantResponse>> getParticipantsByEvent(@PathVariable String eventId) {
        return ResponseEntity.ok(participantService.getParticipantsByEvent(eventId));
    }

    @GetMapping("/manager/{email}")
    public ResponseEntity<List<ParticipantResponse>> getParticipantsByManager(
            @PathVariable String email) {
        return ResponseEntity.ok(participantService.getParticipantsByManager(email));
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<ParticipantResponse>> getParticipantsByLocation(
            @PathVariable String location) {
        return ResponseEntity.ok(participantService.getParticipantsByLocation(location));
    }

    @PostMapping("/event/{eventId}/register")
    public ResponseEntity<ParticipantResponse> registerForEvent(
            @PathVariable String eventId,
            @Valid @RequestBody ParticipantRequest request) {
        ParticipantResponse participant = participantService.registerForEvent(eventId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(participant);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeParticipant(@PathVariable String id) {
        participantService.removeParticipant(id);
        return ResponseEntity.noContent().build();
    }
}