package com.example.soa.Service;

import com.example.soa.Model.Content;
import com.example.soa.Model.User;
import com.example.soa.Repository.EnrollmentRepository;
import com.example.soa.exception.AccessDeniedException;
import com.example.soa.security.UserPrincipal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service to handle content access permissions based on enrollment status
 * and user roles.
 */
@Service
public class ContentAccessService {

    private static final Logger logger = LoggerFactory.getLogger(ContentAccessService.class);

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    /**
     * Checks if the current user has access to the specified content.
     * Access is granted if:
     * 1. User is an ADMIN (always has access)
     * 2. User is the INSTRUCTOR of the course
     * 3. User is a STUDENT enrolled in the course
     *
     * @param content The content to check access for
     * @return true if access is allowed, false otherwise
     */
    public boolean hasAccessToContent(Content content) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // If not authenticated, deny access
        if (authentication == null || !authentication.isAuthenticated() || 
            !(authentication.getPrincipal() instanceof UserPrincipal)) {
            logger.debug("Access denied: User not authenticated");
            return false;
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();
        User.Role userRole = userPrincipal.getRole();
        Long courseId = content.getCourse().getCourseId();
        
        // Admins always have access
        if (userRole == User.Role.ADMIN) {
            logger.debug("Access granted: User is an admin");
            return true;
        }
        
        // Instructors have access to their own courses
        if (userRole == User.Role.INSTRUCTOR && 
            content.getCourse().getInstructor() != null && 
            content.getCourse().getInstructor().getUserId().equals(userId)) {
            logger.debug("Access granted: User is the instructor of the course");
            return true;
        }
        
        // Students need to be enrolled in the course
        if (userRole == User.Role.STUDENT) {
            boolean isEnrolled = enrollmentRepository.findByStudent_UserIdAndCourse_CourseId(userId, courseId).isPresent();
            logger.debug("Student enrollment check for userId {} in courseId {}: {}", userId, courseId, isEnrolled);
            return isEnrolled;
        }
        
        logger.debug("Access denied: User does not meet any access criteria");
        return false;
    }
    
    /**
     * Verifies that the current user has access to the content.
     * Throws an AccessDeniedException if access is denied.
     *
     * @param content The content to check access for
     * @throws AccessDeniedException if the user does not have access
     */
    public void verifyContentAccess(Content content) {
        if (!hasAccessToContent(content)) {
            throw new AccessDeniedException("You do not have permission to access this content");
        }
    }
}