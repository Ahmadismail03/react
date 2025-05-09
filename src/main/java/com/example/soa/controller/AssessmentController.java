package com.example.soa.controller;

import com.example.soa.Dto.AssessmentDTO;
import com.example.soa.Dto.QuizAnswerDTO;
import com.example.soa.Dto.SubmissionDTO;
import com.example.soa.Model.Assessment;
import com.example.soa.Model.Course;
import com.example.soa.Model.QuizAnswer;
import com.example.soa.Model.Submission;
import com.example.soa.exception.AssessmentNotFoundException;
import com.example.soa.mapper.AssessmentMapper;
import com.example.soa.Repository.AssessmentRepository;
import com.example.soa.Repository.CourseRepository;
import com.example.soa.Repository.QuizAnswerRepository;
import com.example.soa.Repository.SubmissionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.server.mvc.WebMvcLinkBuilder;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> createAssessment(@RequestBody AssessmentDTO assessmentDTO) {
        try {
            logger.info("Creating new assessment with title: {}", assessmentDTO.getTitle());
            
            // Validate course exists
            Course course = courseRepository.findById(assessmentDTO.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + assessmentDTO.getCourseId()));

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

    // ... rest of the controller methods ...

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