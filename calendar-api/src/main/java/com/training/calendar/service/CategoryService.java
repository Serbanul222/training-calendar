package com.training.calendar.service;

import com.training.calendar.dto.response.CategoryResponse;

import java.util.List;
import java.util.Optional;

public interface CategoryService {

    /**
     * Get all training categories
     * @return List of categories
     */
    List<CategoryResponse> getAllCategories();

    /**
     * Get category by ID
     * @param id Category ID
     * @return Optional containing the category if found
     */
    Optional<CategoryResponse> getCategoryById(String id);

    /**
     * Initialize default categories if they don't exist
     */
    void initializeDefaultCategories();
}