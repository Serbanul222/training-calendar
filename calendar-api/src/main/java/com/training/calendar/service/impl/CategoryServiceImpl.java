package com.training.calendar.service.impl;

import com.training.calendar.dto.response.CategoryResponse;
import com.training.calendar.model.Category;
import com.training.calendar.repository.CategoryRepository;
import com.training.calendar.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CategoryResponse> getCategoryById(String id) {
        return categoryRepository.findById(id)
                .map(this::mapToCategoryResponse);
    }

    @Override
    @Transactional
    public void initializeDefaultCategories() {
        // Initialize default categories if they don't exist
        List<Category> defaultCategories = Arrays.asList(
                new Category("CONSULTANTA", "ZIUA CONSULTANȚEI", "#4a86e8", "#cfe2ff"),
                new Category("OPTOMETRIE", "ZIUA OPTOMETRIEI", "#9900ff", "#e6ccff"),
                new Category("PRODUSE_HOYA", "ZIUA PRODUSELOR HOYA", "#f1c232", "#fff2cc")
        );

        for (Category category : defaultCategories) {
            categoryRepository.findById(category.getId())
                    .orElseGet(() -> categoryRepository.save(category));
        }
    }

    // Helper method to map entities to DTOs
    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .color(category.getColor())
                .backColor(category.getBackColor())
                .build();
    }
}