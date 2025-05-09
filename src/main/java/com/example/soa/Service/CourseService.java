package com.example.soa.Service;

import com.example.soa.Model.Course;
import com.example.soa.Model.Enrollment;
import com.example.soa.Model.User;
import com.example.soa.Repository.CourseRepository;
import com.example.soa.Repository.UserRepository;
import com.example.soa.exception.CourseNotFoundException;
import com.example.soa.exception.UserNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Course createCourse(Course course) {
        // If instructor ID is provided, verify the instructor exists
        if (course.getInstructor() != null && course.getInstructor().getUserId() != null) {
            User instructor = userRepository.findById(course.getInstructor().getUserId())
                .orElseThrow(() -> new UserNotFoundException("Instructor not found with ID: " + course.getInstructor().getUserId()));
            course.setInstructor(instructor);
        }
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));
    }

    public Course updateCourse(Long courseId, Course course) {
        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));
        existingCourse.setTitle(course.getTitle());
        existingCourse.setDescription(course.getDescription());
        
        // Update tags if provided
        if (course.getTags() != null) {
            existingCourse.setTags(course.getTags());
        }
        
        // Update prerequisites if provided
        if (course.getPrerequisites() != null) {
            existingCourse.setPrerequisites(course.getPrerequisites());
        }
        
        // Handle instructor update
        if (course.getInstructor() != null && course.getInstructor().getUserId() != null) {
            User instructor = userRepository.findById(course.getInstructor().getUserId())
                .orElseThrow(() -> new UserNotFoundException("Instructor not found with ID: " + course.getInstructor().getUserId()));
            existingCourse.setInstructor(instructor);
        }
        
        Course updatedCourse = courseRepository.save(existingCourse);

        // Send notifications to enrolled students
        for (Enrollment enrollment : updatedCourse.getEnrollments()) {
            User student = enrollment.getStudent();
            String title = "Course Update: " + updatedCourse.getTitle();
            String message = String.format("The course '%s' has been updated. Please check the course page for the latest information.", 
                updatedCourse.getTitle());
            
            notificationService.createNotification(
                title,
                message,
                student.getEmail(),
                "COURSE_UPDATE",
                student
            );
        }
        
        return updatedCourse;
    }

    public void deleteCourse(Long courseId) {
        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));
        courseRepository.delete(existingCourse);
    }

    public Course assignInstructor(Long courseId, Long instructorId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found with ID: " + courseId));
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new UserNotFoundException("Instructor not found with ID: " + instructorId));
        course.setInstructor(instructor);
        return courseRepository.save(course);
    }
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }
    
    public List<Course> getCoursesByInstructor(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new UserNotFoundException("Instructor not found with ID: " + instructorId));
        return courseRepository.findByInstructor(instructor);
    }
}