package com.example.soa.controller;

import com.example.soa.Model.Enrollment;
import com.example.soa.Dto.EnrollmentDTO;
import com.example.soa.Dto.EnrollmentRequestDTO;
import com.example.soa.Service.EnrollmentService;
import com.example.soa.exception.EnrollmentNotFoundException;
import com.example.soa.mapper.EnrollmentMapper;
import com.example.soa.security.UserPrincipal;
import com.example.soa.Model.Course;
import com.example.soa.Repository.CourseRepository;
import com.example.soa.Repository.EnrollmentRepository;
import com.example.soa.exception.ResourceNotFoundException;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    private static final Logger logger = LoggerFactory.getLogger(EnrollmentController.class);

    private final EnrollmentService enrollmentService;
    private final EnrollmentMapper enrollmentMapper;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentController(
            EnrollmentService enrollmentService, 
            EnrollmentMapper enrollmentMapper,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository) {
        this.enrollmentService = enrollmentService;
        this.enrollmentMapper = enrollmentMapper;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<?> enrollStudent(@PathVariable Long courseId, @RequestParam Long studentId) {
        try {
            Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId);
            return ResponseEntity.ok(enrollment);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to enroll student: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> enrollStudentWithBody(@RequestBody Map<String, Long> request) {
        try {
            Long courseId = request.get("courseId");
            Long studentId = request.get("studentId");
            
            if (courseId == null || studentId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Both courseId and studentId are required"));
            }

            Enrollment enrollment = enrollmentService.enrollStudent(studentId, courseId);
            return ResponseEntity.ok(enrollment);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to enroll student: " + e.getMessage()));
        }
    }

    @DeleteMapping("/course/{courseId}/student/{studentId}")
    public ResponseEntity<?> unenrollStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        try {
            enrollmentService.unenrollStudent(studentId, courseId);
            return ResponseEntity.ok(Map.of("message", "Student successfully unenrolled from course"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to unenroll student: " + e.getMessage()));
        }
    }

    @PutMapping("/{enrollmentId}/progress")
    public ResponseEntity<?> updateProgress(@PathVariable Long enrollmentId, @RequestBody Map<String, Float> progressUpdate) {
        try {
            Float progress = progressUpdate.get("progress");
            if (progress == null || progress < 0 || progress > 100) {
                return ResponseEntity.badRequest().body(Map.of("message", "Progress must be between 0 and 100"));
            }
            Enrollment updatedEnrollment = enrollmentService.updateEnrollmentProgress(enrollmentId, progress);
            return ResponseEntity.ok(updatedEnrollment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update progress: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyEnrollments() {
        try {
            // Get the current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Long studentId = userPrincipal.getId();
            
            logger.info("Fetching enrollments for authenticated user with ID: {}", studentId);
            
            // Get enrollments for the current user
            List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
            
            // Convert enrollments to DTOs with course information
            List<Map<String, Object>> enrollmentData = enrollments.stream().map(enrollment -> {
                Map<String, Object> data = Map.of(
                    "enrollmentId", enrollment.getEnrollmentId(),
                    "courseId", enrollment.getCourse().getCourseId(),
                    "courseName", enrollment.getCourse().getTitle(),
                    "enrollmentDate", enrollment.getEnrollmentDate(),
                    "progress", enrollment.getProgress(),
                    "completionStatus", enrollment.getCompletionStatus()
                );
                return data;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(enrollmentData);
        } catch (Exception e) {
            logger.error("Failed to fetch enrollments for authenticated user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch enrollments: " + e.getMessage()));
        }
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getEnrollmentsByStudent(@PathVariable Long studentId) {
        try {
            List<Enrollment> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
            return ResponseEntity.ok(enrollments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch enrollments: " + e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getEnrollmentsByCourse(@PathVariable Long courseId) {
        try {
            logger.info("Fetching enrollments for course with ID: {}", courseId);
            
            // Get the current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            // Check if the user is an admin or instructor (for access control)
            boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            // You may want to check if the instructor teaches this course, if not admin
            
            // Get the course enrollments
            List<Enrollment> enrollments = findEnrollmentsForCourse(courseId);
            
            // Map enrollments to DTOs with student information
            List<Map<String, Object>> enrollmentData = enrollments.stream().map(enrollment -> {
                Map<String, Object> data = new HashMap<>();
                data.put("enrollmentId", enrollment.getEnrollmentId());
                data.put("studentId", enrollment.getStudent().getUserId());
                data.put("studentName", enrollment.getStudent().getName());
                data.put("studentEmail", enrollment.getStudent().getEmail());
                data.put("enrollmentDate", enrollment.getEnrollmentDate());
                data.put("progress", enrollment.getProgress());
                data.put("completionStatus", enrollment.getCompletionStatus());
                
                return data;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(enrollmentData);
        } catch (Exception e) {
            logger.error("Failed to fetch enrollments for course ID {}: {}", courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch enrollments: " + e.getMessage()));
        }
    }

    // Helper method to find enrollments for a course
    private List<Enrollment> findEnrollmentsForCourse(Long courseId) {
        // Try to find the course first
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        
        // Get enrollments for this course
        // Adding this temp solution since we don't have the repository method yet
        List<Enrollment> allEnrollments = enrollmentRepository.findAll();
        return allEnrollments.stream()
            .filter(e -> e.getCourse().getCourseId().equals(courseId))
            .collect(Collectors.toList());
        
        // Once you add the proper repository method, you can use:
        // return enrollmentRepository.findByCourse_CourseId(courseId);
    }
}