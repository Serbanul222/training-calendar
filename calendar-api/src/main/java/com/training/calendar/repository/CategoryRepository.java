package com.training.calendar.repository;

import com.training.calendar.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    // Since we only need basic CRUD operations, no additional methods are required
    // The JpaRepository provides methods like findAll(), findById(), save(), deleteById() etc.
}