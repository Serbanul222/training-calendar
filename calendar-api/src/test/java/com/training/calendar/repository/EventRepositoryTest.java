package com.training.calendar.repository;

import com.training.calendar.model.Category;
import com.training.calendar.model.Event;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class EventRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Category consultantaCategory;

    @BeforeEach
    void setup() {
        // Create a category
        consultantaCategory = new Category();
        consultantaCategory.setId("CONSULTANTA");
        consultantaCategory.setName("ZIUA CONSULTANȚEI");
        consultantaCategory.setColor("#4a86e8");
        consultantaCategory.setBackColor("#cfe2ff");
        entityManager.persist(consultantaCategory);

        // Clear the events to ensure a clean test
        eventRepository.deleteAll();
    }

    @Test
    void findByYearAndMonthShouldReturnEventsInSpecificMonthAndYear() {
        // Given
        LocalDate date = LocalDate.of(2025, 6, 15);

        Event event = new Event();
        event.setEventDate(date);
        event.setCategoryId(consultantaCategory.getId());
        event.setLocation("București");
        event.setMaxParticipants(10);
        event.setDescription("Test event");

        entityManager.persist(event);
        entityManager.flush();

        // When
        List<Event> foundEvents = eventRepository.findByYearAndMonth(2025, 6);

        // Then
        assertThat(foundEvents).hasSize(1);
        assertThat(foundEvents.get(0).getEventDate()).isEqualTo(date);
    }

    @Test
    void findByEventDateBetweenShouldReturnEventsInDateRange() {
        // Given
        LocalDate date1 = LocalDate.of(2025, 5, 10);
        LocalDate date2 = LocalDate.of(2025, 5, 20);
        LocalDate date3 = LocalDate.of(2025, 6, 5);

        Event event1 = new Event();
        event1.setEventDate(date1);
        event1.setCategoryId(consultantaCategory.getId());
        event1.setLocation("București");
        event1.setMaxParticipants(10);

        Event event2 = new Event();
        event2.setEventDate(date2);
        event2.setCategoryId(consultantaCategory.getId());
        event2.setLocation("Cluj");
        event2.setMaxParticipants(8);

        Event event3 = new Event();
        event3.setEventDate(date3);
        event3.setCategoryId(consultantaCategory.getId());
        event3.setLocation("Timișoara");
        event3.setMaxParticipants(12);

        entityManager.persist(event1);
        entityManager.persist(event2);
        entityManager.persist(event3);
        entityManager.flush();

        // When
        LocalDate startDate = LocalDate.of(2025, 5, 1);
        LocalDate endDate = LocalDate.of(2025, 5, 31);
        List<Event> foundEvents = eventRepository.findByEventDateBetween(startDate, endDate);

        // Then
        assertThat(foundEvents).hasSize(2);
        assertThat(foundEvents).extracting(Event::getLocation)
                .containsExactlyInAnyOrder("București", "Cluj");
    }
}