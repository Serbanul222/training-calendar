package com.training.calendar.repository;

import com.training.calendar.model.UserRole;
import com.training.calendar.model.UserRoleId; // <<< IMPORT THE COMPOSITE ID CLASS
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Optional, but good practice

@Repository // Add @Repository for clarity and component scanning if not already picked up
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> { // <<< CHANGE String to UserRoleId
    // You can add custom query methods here if needed, for example:
    // List<UserRole> findById_UserId(UUID userId);
    // List<UserRole> findById_RoleId(Integer roleId);
}