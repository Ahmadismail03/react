package com.example.soa.mapper;

import com.example.soa.Dto.AssessmentDTO;
import com.example.soa.Dto.QuizAnswerDTO;
import com.example.soa.Dto.SubmissionDTO;
import com.example.soa.Model.Assessment;
import com.example.soa.Model.QuizAnswer;
import com.example.soa.Model.Submission;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AssessmentMapper {

    public AssessmentDTO toAssessmentDTO(Assessment assessment) {
        AssessmentDTO dto = new AssessmentDTO();
        dto.setAssessmentId(assessment.getAssessmentId());
        dto.setCourseId(assessment.getCourse().getCourseId());
        dto.setTitle(assessment.getTitle());
        dto.setType(assessment.getType().name());
        dto.setTotalMarks(assessment.getTotalMarks());
        dto.setSubmissions(toSubmissionDTOs(assessment.getSubmissions()));
        dto.setQuizAnswers(toQuizAnswerDTOs(assessment.getQuizAnswers()));
        return dto;
    }

    public SubmissionDTO toSubmissionDTO(Submission submission) {
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(submission.getSubmissionId());
        dto.setAssessmentId(submission.getAssessment().getAssessmentId());
        dto.setContent(submission.getContent());
        return dto;
    }

    public QuizAnswerDTO toQuizAnswerDTO(QuizAnswer quizAnswer) {
        QuizAnswerDTO dto = new QuizAnswerDTO();
        dto.setId(quizAnswer.getAnswerId());
        dto.setAssessmentId(quizAnswer.getAssessment().getAssessmentId());
        dto.setQuestion(quizAnswer.getQuestion());
        dto.setCorrectAnswer(quizAnswer.getCorrectAnswer());
        return dto;
    }

    public List<SubmissionDTO> toSubmissionDTOs(List<Submission> submissions) {
        return submissions.stream()
                .map(this::toSubmissionDTO)
                .collect(Collectors.toList());
    }

    public List<QuizAnswerDTO> toQuizAnswerDTOs(List<QuizAnswer> quizAnswers) {
        return quizAnswers.stream()
                .map(this::toQuizAnswerDTO)
                .collect(Collectors.toList());
    }
}