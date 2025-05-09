package com.example.soa.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.soa.Model.Assessment;
import com.example.soa.Model.QuizAnswer;
import com.example.soa.Model.Submission;
import com.example.soa.Repository.AssessmentRepository;
import com.example.soa.Repository.QuizAnswerRepository;
import com.example.soa.Repository.SubmissionRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class AssessmentService {

    private static final Logger logger = LoggerFactory.getLogger(AssessmentService.class);

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private QuizAnswerRepository quizAnswerRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    public Assessment createAssessment(Assessment assessment) {
        logger.info("Creating assessment with title: {}", assessment.getTitle());
        Assessment createdAssessment = assessmentRepository.save(assessment);
        logger.info("Assessment created successfully with ID: {}", createdAssessment.getAssessmentId());
        return createdAssessment;
    }

    public QuizAnswer addQuizAnswer(Long assessmentId, QuizAnswer quizAnswer) {
        logger.info("Adding quiz answer to assessment with ID: {}", assessmentId);
        quizAnswer.setAssessment(assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with ID: " + assessmentId)));
        QuizAnswer savedQuizAnswer = quizAnswerRepository.save(quizAnswer);
        logger.info("Quiz answer added successfully with ID: {}", savedQuizAnswer.getAnswerId());
        return savedQuizAnswer;
    }

    public void autoGradeQuiz(Long assessmentId) {
        logger.info("Auto-grading quiz for assessment with ID: {}", assessmentId);
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with ID: " + assessmentId));
        assessment.autoGradeQuiz();
        assessmentRepository.save(assessment);
        logger.info("Quiz auto-graded successfully for assessment with ID: {}", assessmentId);
    }

    public Submission submitAssessment(Long assessmentId, Submission submission) {
        logger.info("Submitting assessment with ID: {}", assessmentId);
        submission.setAssessment(assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with ID: " + assessmentId)));
        Submission savedSubmission = submissionRepository.save(submission);
        logger.info("Assessment submitted successfully with submission ID: {}", savedSubmission.getSubmissionId());
        return savedSubmission;
    }

    public List<Submission> getSubmissions(Long assessmentId) {
        logger.info("Fetching submissions for assessment with ID: {}", assessmentId);
        List<Submission> submissions = submissionRepository.findByAssessment_AssessmentId(assessmentId);
        logger.info("Fetched {} submissions for assessment with ID: {}", submissions.size(), assessmentId);
        return submissions;
    }
}