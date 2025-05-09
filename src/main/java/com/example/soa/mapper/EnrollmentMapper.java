package com.example.soa.mapper;

import com.example.soa.Dto.EnrollmentDTO;
import com.example.soa.Model.Enrollment;
import org.springframework.stereotype.Component;

@Component
public class EnrollmentMapper {

    public EnrollmentDTO toEnrollmentDTO(Enrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setEnrollmentId(enrollment.getEnrollmentId());
        dto.setStudentId(enrollment.getStudent().getUserId());
        dto.setCourseId(enrollment.getCourse().getCourseId());
        dto.setEnrollmentDate(enrollment.getEnrollmentDate());
        dto.setProgress(enrollment.getProgress());
        dto.setCompletionStatus(enrollment.getCompletionStatus());
        return dto;
    }

    public Enrollment toEnrollment(EnrollmentDTO enrollmentDTO) {
        Enrollment enrollment = new Enrollment();
        enrollment.setEnrollmentId(enrollmentDTO.getEnrollmentId());
        enrollment.setEnrollmentDate(enrollmentDTO.getEnrollmentDate());
        enrollment.setProgress(enrollmentDTO.getProgress());
        enrollment.setCompletionStatus(enrollmentDTO.getCompletionStatus());
        return enrollment;
    }
}