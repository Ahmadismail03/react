package com.example.soa.controller;

import com.example.soa.Dto.AssessmentDTO;
import com.example.soa.Dto.QuizAnswerDTO;
import com.example.soa.Dto.SubmissionDTO;
import com.example.soa.Model.Assessment;
import com.example.soa.Model.Course;
import com.example.soa.Model.QuizAnswer;
import com.example.soa.Model.Submission;
import com.example.soa.Model.User;
import com.example.soa.exception.AssessmentNotFoundException;
import com.example.soa.mapper.AssessmentMapper;
import com.example.soa.Repository.AssessmentRepository;
import com.example.soa.Repository.CourseRepository;
import com.example.soa.Repository.QuizAnswerRepository;
import com.example.soa.Repository.SubmissionRepository;
import com.example.soa.security.UserPrincipal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assessment")
public class AssessmentController {

    private static final Logger logger = LoggerFactory.getLogger(AssessmentController.class);

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private QuizAnswerRepository quizAnswerRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AssessmentMapper assessmentMapper;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<?> createAssessment(
            @RequestBody AssessmentDTO assessmentDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Creating new assessment with title: {}", assessmentDTO.getTitle());
            
            // Validate course exists
            Course course = courseRepository.findById(assessmentDTO.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + assessmentDTO.getCourseId()));
            
            // Verify user has permission to create assessment for this course
            if (!currentUser.getRole().name().equals("ADMIN") && 
                !course.getInstructor().getUserId().equals(currentUser.getId())) {
                logger.warn("User {} attempting to create assessment for course they don't own", currentUser.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("You don't have permission to create assessments for this course"));
            }

            Assessment assessment = new Assessment();
            assessment.setTitle(assessmentDTO.getTitle());
            assessment.setType(Assessment.AssessmentType.valueOf(assessmentDTO.getType()));
            assessment.setTotalMarks(assessmentDTO.getTotalMarks());
            assessment.setCourse(course);
            
            // Initialize empty lists
            assessment.setSubmissions(new ArrayList<>());
            assessment.setQuizAnswers(new ArrayList<>());
            
            Assessment savedAssessment = assessmentRepository.save(assessment);
            AssessmentDTO savedAssessmentDTO = assessmentMapper.toAssessmentDTO(savedAssessment);
            savedAssessmentDTO.add(WebMvcLinkBuilder.linkTo(WebMvcLinkBuilder.methodOn(AssessmentController.class)
                .getAssessment(savedAssessment.getAssessmentId())).withSelfRel());
            
            logger.info("Assessment created successfully with ID: {}", savedAssessment.getAssessmentId());
            return ResponseEntity.ok(savedAssessmentDTO);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid assessment type: {}", assessmentDTO.getType());
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Invalid assessment type. Must be either QUIZ or ASSIGNMENT"));
        } catch (RuntimeException e) {
            logger.error("Error creating assessment: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<AssessmentDTO> getAssessment(@PathVariable Long assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
            .orElseThrow(() -> new AssessmentNotFoundException("Assessment not found with ID: " + assessmentId));
        return ResponseEntity.ok(assessmentMapper.toAssessmentDTO(assessment));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssessmentDTO>> getCourseAssessments(@PathVariable Long courseId) {
        logger.info("Fetching assessments for course ID: {}", courseId);
        
        List<Assessment> assessments = assessmentRepository.findByCourse_CourseId(courseId);
        List<AssessmentDTO> assessmentDTOs = assessments.stream()
            .map(assessmentMapper::toAssessmentDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(assessmentDTOs);
    }

    @PutMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<?> updateAssessment(
            @PathVariable Long assessmentId,
            @RequestBody AssessmentDTO assessmentDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Updating assessment with ID: {}", assessmentId);
            
            Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new AssessmentNotFoundException("Assessment not found with ID: " + assessmentId));
            
            Course course = assessment.getCourse();
            
            // Verify user has permission to update this assessment
            if (!currentUser.getRole().name().equals("ADMIN") && 
                !course.getInstructor().getUserId().equals(currentUser.getId())) {
                logger.warn("User {} attempting to update assessment for course they don't own", currentUser.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("You don't have permission to update this assessment"));
            }
            
            // Update assessment fields
            assessment.setTitle(assessmentDTO.getTitle());
            assessment.setTotalMarks(assessmentDTO.getTotalMarks());
            
            if (assessmentDTO.getType() != null) {
                assessment.setType(Assessment.AssessmentType.valueOf(assessmentDTO.getType()));
            }
            
            Assessment updatedAssessment = assessmentRepository.save(assessment);
            AssessmentDTO updatedDTO = assessmentMapper.toAssessmentDTO(updatedAssessment);
            
            return ResponseEntity.ok(updatedDTO);
        } catch (Exception e) {
            logger.error("Error updating assessment: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to update assessment: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<?> deleteAssessment(
            @PathVariable Long assessmentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Deleting assessment with ID: {}", assessmentId);
            
            Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new AssessmentNotFoundException("Assessment not found with ID: " + assessmentId));
            
            Course course = assessment.getCourse();
            
            // Verify user has permission to delete this assessment
            if (!currentUser.getRole().name().equals("ADMIN") && 
                !course.getInstructor().getUserId().equals(currentUser.getId())) {
                logger.warn("User {} attempting to delete assessment for course they don't own", currentUser.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("You don't have permission to delete this assessment"));
            }
            
            assessmentRepository.delete(assessment);
            
            logger.info("Assessment deleted successfully with ID: {}", assessmentId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting assessment: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to delete assessment: " + e.getMessage()));
        }
    }

    @PostMapping("/{assessmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitAssessment(
            @PathVariable Long assessmentId,
            @RequestBody SubmissionDTO submissionDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Student {} submitting assessment {}", currentUser.getId(), assessmentId);
            
            Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new AssessmentNotFoundException("Assessment not found with ID: " + assessmentId));
            
            // Get the user from the database
            User student = new User();
            student.setUserId(currentUser.getId());
            
            // Create submission
            Submission submission = new Submission();
            submission.setAssessment(assessment);
            submission.setStudent(student);
            submission.setSubmissionDate(java.time.LocalDateTime.now());
            submission.setStudentAnswers(submissionDTO.getSubmittedAnswers());
            
            Submission savedSubmission = submissionRepository.save(submission);
            
            logger.info("Assessment submitted successfully by student {}", currentUser.getId());
            return ResponseEntity.ok(savedSubmission);
        } catch (Exception e) {
            logger.error("Error submitting assessment: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to submit assessment: " + e.getMessage()));
        }
    }

    @GetMapping("/{assessmentId}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<?> getAssessmentSubmissions(
            @PathVariable Long assessmentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Fetching submissions for assessment ID: {}", assessmentId);
            
            Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new AssessmentNotFoundException("Assessment not found with ID: " + assessmentId));
            
            Course course = assessment.getCourse();
            
            // Verify user has permission to view submissions
            if (!currentUser.getRole().name().equals("ADMIN") && 
                !course.getInstructor().getUserId().equals(currentUser.getId())) {
                logger.warn("User {} attempting to view submissions for course they don't own", currentUser.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("You don't have permission to view these submissions"));
            }
            
            List<Submission> submissions = submissionRepository.findByAssessment_AssessmentId(assessmentId);
            
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            logger.error("Error fetching submissions: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch submissions: " + e.getMessage()));
        }
    }

    @PostMapping("/{assessmentId}/grade/{submissionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long assessmentId,
            @PathVariable Long submissionId,
            @RequestParam Integer score,
            @RequestParam(required = false) String feedback,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            logger.info("Grading submission {} for assessment {}", submissionId, assessmentId);
            
            Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
            
            Assessment assessment = submission.getAssessment();
            Course course = assessment.getCourse();
            
            // Verify user has permission to grade
            if (!currentUser.getRole().name().equals("ADMIN") && 
                !course.getInstructor().getUserId().equals(currentUser.getId())) {
                logger.warn("User {} attempting to grade submission for course they don't own", currentUser.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("You don't have permission to grade this submission"));
            }
            
            submission.setScore(score);
            submission.setGradedBy(currentUser.getId());
            submission.setGradedDate(java.time.LocalDateTime.now());
            
            if (feedback != null) {
                submission.setFeedback(feedback);
            }
            
            Submission gradedSubmission = submissionRepository.save(submission);
            
            logger.info("Submission graded successfully");
            return ResponseEntity.ok(gradedSubmission);
        } catch (Exception e) {
            logger.error("Error grading submission: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to grade submission: " + e.getMessage()));
        }
    }

    private static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}