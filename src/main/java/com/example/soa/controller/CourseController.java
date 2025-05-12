package com.example.soa.controller;

import com.example.soa.Dto.CourseDTO;
import com.example.soa.Model.Course;
import com.example.soa.Model.User;
import com.example.soa.Service.ContentService;
import com.example.soa.exception.CourseNotFoundException;
import com.example.soa.mapper.CourseMapper;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.soa.Service.CourseService;
import com.example.soa.Service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);

    private final CourseService courseService;
    private final CourseMapper courseMapper;

    public CourseController(CourseService courseService, CourseMapper courseMapper) {
        this.courseService = courseService;
        this.courseMapper = courseMapper;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        logger.info("Creating new course with title: {}", courseDTO.getTitle());
        
        // If name is not provided but title is, use title as name
        if ((courseDTO.getName() == null || courseDTO.getName().trim().isEmpty()) && 
            courseDTO.getTitle() != null && !courseDTO.getTitle().trim().isEmpty()) {
            courseDTO.setName(courseDTO.getTitle());
            logger.info("Using title as name for the course: {}", courseDTO.getTitle());
        }
        
        // Set default dates if not provided
        if (courseDTO.getStartDate() == null) {
            courseDTO.setStartDate(java.time.LocalDate.now());
            logger.info("Setting default start date to today");
        }
        
        if (courseDTO.getEndDate() == null) {
            // Default end date is 3 months from start date
            courseDTO.setEndDate(courseDTO.getStartDate().plusMonths(3));
            logger.info("Setting default end date to 3 months from start date");
        }
        
        // Get current authenticated user
        User currentUser = courseService.getCurrentUser();
        
        // If instructor ID is not provided in the request, set the current user as instructor
        if (courseDTO.getInstructorId() == null) {
            courseDTO.setInstructorId(currentUser.getUserId());
            logger.info("Setting instructor ID to current user: {}", currentUser.getUserId());
        } else {
            // Only ADMIN can set a different instructor
            if (!currentUser.getRole().equals(User.Role.ADMIN) && 
                !courseDTO.getInstructorId().equals(currentUser.getUserId())) {
                logger.warn("Non-admin user trying to set different instructor");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            logger.info("Using provided instructor ID: {}", courseDTO.getInstructorId());
        }
        
        Course course = courseMapper.toCourse(courseDTO);
        Course createdCourse = courseService.createCourse(course);
        CourseDTO createdCourseDTO = courseMapper.toCourseDTO(createdCourse);
        try {
            createdCourseDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(CourseController.class)
                .getCourseById(createdCourse.getCourseId())).withSelfRel());
        } catch (Exception e) {
            logger.warn("Could not add HATEOAS link to response: {}", e.getMessage());
        }
        logger.info("Course created successfully with ID: {}", createdCourse.getCourseId());
        return new ResponseEntity<>(createdCourseDTO, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        logger.info("Fetching all courses");
        List<Course> courses = courseService.getAllCourses();
        List<CourseDTO> courseDTOs = courses.stream()
                .map(courseMapper::toCourseDTO)
                .collect(Collectors.toList());
        try {
            courseDTOs.forEach(dto -> {
                try {
                    dto.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(CourseController.class)
                        .getCourseById(dto.getCourseId())).withSelfRel());
                } catch (Exception e) {
                    logger.warn("Could not add HATEOAS link to course DTO: {}", e.getMessage());
                }
            });
        } catch (Exception e) {
            logger.warn("Could not add HATEOAS links to response: {}", e.getMessage());
        }
        logger.info("Fetched {} courses", courseDTOs.size());
        return new ResponseEntity<>(courseDTOs, HttpStatus.OK);
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<List<CourseDTO>> getInstructorCourses() {
        logger.info("Fetching courses for instructor");
        // Get the currently authenticated user
        User currentUser = courseService.getCurrentUser();
        
        List<Course> courses;
        if (currentUser.getRole().equals(User.Role.ADMIN)) {
            // Admins can see all courses
            courses = courseService.getAllCourses();
        } else {
            // Instructors see only their courses
            courses = courseService.getCoursesByInstructor(currentUser.getUserId());
        }
        
        List<CourseDTO> courseDTOs = courses.stream()
                .map(courseMapper::toCourseDTO)
                .collect(Collectors.toList());
                
        try {
            courseDTOs.forEach(dto -> {
                try {
                    dto.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(CourseController.class)
                        .getCourseById(dto.getCourseId())).withSelfRel());
                } catch (Exception e) {
                    logger.warn("Could not add HATEOAS link to course DTO: {}", e.getMessage());
                }
            });
        } catch (Exception e) {
            logger.warn("Could not add HATEOAS links to response: {}", e.getMessage());
        }
        
        logger.info("Fetched {} courses for instructor", courseDTOs.size());
        return new ResponseEntity<>(courseDTOs, HttpStatus.OK);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long courseId) {
        logger.info("Fetching course with ID: {}", courseId);
        Course course = courseService.getCourseById(courseId);
        CourseDTO courseDTO = courseMapper.toCourseDTO(course);
        try {
            courseDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(CourseController.class)
                .getCourseById(courseId)).withSelfRel());
        } catch (Exception e) {
            logger.warn("Could not add HATEOAS link to response: {}", e.getMessage());
        }
        logger.info("Fetched course with ID: {}", courseId);
        return new ResponseEntity<>(courseDTO, HttpStatus.OK);
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long courseId, @RequestBody CourseDTO courseDTO) {
        logger.info("Updating course with ID: {}", courseId);
        
        // Check if courseId is valid
        if (courseId == null || courseId <= 0) {
            logger.error("Invalid course ID: {}", courseId);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        // Set the course ID from the path variable to ensure consistency
        courseDTO.setCourseId(courseId);
        
        // Check if user has permission to update this course
        User currentUser = courseService.getCurrentUser();
        Course existingCourse = courseService.getCourseById(courseId);
        
        // Only course instructor or admin can update the course
        if (!currentUser.getRole().equals(User.Role.ADMIN) && 
            !existingCourse.getInstructor().getUserId().equals(currentUser.getUserId())) {
            logger.warn("User {} trying to update course they don't own", currentUser.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        try {
            Course course = courseMapper.toCourse(courseDTO);
            Course updatedCourse = courseService.updateCourse(courseId, course);
            CourseDTO updatedCourseDTO = courseMapper.toCourseDTO(updatedCourse);
            try {
                updatedCourseDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(CourseController.class)
                    .getCourseById(updatedCourse.getCourseId())).withSelfRel());
            } catch (Exception e) {
                logger.warn("Could not add HATEOAS link to response: {}", e.getMessage());
            }
            logger.info("Course updated successfully with ID: {}", updatedCourse.getCourseId());
            return new ResponseEntity<>(updatedCourseDTO, HttpStatus.OK);
        } catch (CourseNotFoundException e) {
            logger.error("Course not found with ID: {}", courseId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error updating course with ID: {}, Error: {}", courseId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        logger.info("Deleting course with ID: {}", courseId);
        
        // Check if courseId is valid
        if (courseId == null || courseId <= 0) {
            logger.error("Invalid course ID: {}", courseId);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        try {
            courseService.deleteCourse(courseId);
            logger.info("Course deleted successfully with ID: {}", courseId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (CourseNotFoundException e) {
            logger.error("Course not found with ID: {}", courseId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            logger.error("Error deleting course with ID: {}, Error: {}", courseId, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{courseId}/assignInstructor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> assignInstructor(@PathVariable Long courseId, @RequestParam Long instructorId) {
        logger.info("Assigning instructor with ID: {} to course with ID: {}", instructorId, courseId);
        Course course = courseService.assignInstructor(courseId, instructorId);
        CourseDTO courseDTO = courseMapper.toCourseDTO(course);
        try {
            courseDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(CourseController.class)
                .getCourseById(course.getCourseId())).withSelfRel());
        } catch (Exception e) {
            logger.warn("Could not add HATEOAS link to response: {}", e.getMessage());
        }
        logger.info("Instructor assigned successfully to course with ID: {}", courseId);
        return new ResponseEntity<>(courseDTO, HttpStatus.OK);
    }
}