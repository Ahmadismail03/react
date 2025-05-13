package com.example.soa.Service;

import com.example.soa.Model.Enrollment;
import com.example.soa.Model.User;
import com.example.soa.Model.Course;
import com.example.soa.Repository.EnrollmentRepository;
import com.example.soa.Repository.UserRepository;
import com.example.soa.Repository.CourseRepository;
import com.example.soa.exception.EnrollmentNotFoundException;
import com.example.soa.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;

@Service
public class EnrollmentService {

    private static final Logger logger = LoggerFactory.getLogger(EnrollmentService.class);

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    public Enrollment enrollStudent(Long studentId, Long courseId) {
        logger.info("Enrolling student with ID: {} to course with ID: {}", studentId, courseId);
        
        // Find the student
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
            
        // Find the course
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
            
        // Check if enrollment already exists
        if (enrollmentRepository.findByStudent_UserIdAndCourse_CourseId(studentId, courseId).isPresent()) {
            throw new IllegalStateException("Student is already enrolled in this course");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setProgress(0.0f);
        enrollment.setCompletionStatus(false);
        
        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        logger.info("Student enrolled successfully with enrollment ID: {}", savedEnrollment.getEnrollmentId());
        return savedEnrollment;
    }

    public void unenrollStudent(Long studentId, Long courseId) {
        logger.info("Unenrolling student with ID: {} from course with ID: {}", studentId, courseId);
        Enrollment enrollment = enrollmentRepository.findByStudent_UserIdAndCourse_CourseId(studentId, courseId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Enrollment not found for student ID: " + studentId + " and course ID: " + courseId));
        enrollmentRepository.delete(enrollment);
        logger.info("Student unenrolled successfully from course with ID: {}", courseId);
    }

    public Enrollment updateEnrollmentProgress(Long enrollmentId, Float progress) {
        logger.info("Updating progress for enrollment ID: {} to {}", enrollmentId, progress);
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Enrollment not found with ID: " + enrollmentId));
        enrollment.setProgress(progress);
        if (progress >= 100.0f) {
            enrollment.setCompletionStatus(true);
        }
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        logger.info("Progress updated successfully for enrollment ID: {}", enrollmentId);
        return updatedEnrollment;
    }

    public List<Enrollment> getEnrollmentsByStudent(Long studentId) {
        logger.info("Fetching enrollments for student with ID: {}", studentId);
        List<Enrollment> enrollments = enrollmentRepository.findByStudent_UserId(studentId);
        logger.info("Fetched {} enrollments for student with ID: {}", enrollments.size(), studentId);
        return enrollments;
    }

    public List<Enrollment> getEnrollmentsByCourse(Long courseId) {
        logger.info("Fetching enrollments for course with ID: {}", courseId);
        
        // Find the course
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
            
        // Find all enrollments for this course using the repository
        List<Enrollment> enrollments = enrollmentRepository.findByCourse_CourseId(courseId);
        
        logger.info("Found {} enrollments for course with ID: {}", enrollments.size(), courseId);
        return enrollments;
    }
}