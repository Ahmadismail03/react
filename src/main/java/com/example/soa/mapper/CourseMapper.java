package com.example.soa.mapper;

import com.example.soa.Model.Course;
import com.example.soa.Model.User;
import com.example.soa.Dto.CourseDTO;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Component
public class CourseMapper {

    public CourseDTO toCourseDTO(Course course) {
        if (course == null) {
            return null;
        }

        CourseDTO courseDTO = new CourseDTO();
        courseDTO.setCourseId(course.getCourseId());
        courseDTO.setName(course.getName());
        courseDTO.setDescription(course.getDescription());
        courseDTO.setStartDate(course.getStartDate());
        courseDTO.setEndDate(course.getEndDate());
        courseDTO.setTitle(course.getTitle());
        
        if (course.getInstructor() != null) {
            courseDTO.setInstructorId(course.getInstructor().getUserId());
        }
        
        if (course.getEnrollments() != null) {
            courseDTO.setEnrollmentIds(course.getEnrollments().stream()
                .map(enrollment -> enrollment.getEnrollmentId())
                .collect(Collectors.toList()));
        }
        
        if (course.getContents() != null) {
            courseDTO.setContentIds(course.getContents().stream()
                .map(content -> content.getContentId())
                .collect(Collectors.toList()));
        }
        
        if (course.getAssessments() != null) {
            courseDTO.setAssessmentIds(course.getAssessments().stream()
                .map(assessment -> assessment.getAssessmentId())
                .collect(Collectors.toList()));
        }
        // Map tags and prerequisites
        courseDTO.setTags(course.getTags());
        courseDTO.setPrerequisites(course.getPrerequisites());
        return courseDTO;
    }

    public Course toCourse(CourseDTO courseDTO) {
        if (courseDTO == null) {
            throw new IllegalArgumentException("CourseDTO cannot be null");
        }

        if (courseDTO.getName() == null || courseDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Course name is required");
        }

        Course course = new Course();
        course.setCourseId(courseDTO.getCourseId());
        course.setName(courseDTO.getName().trim());
        course.setDescription(courseDTO.getDescription());
        course.setStartDate(courseDTO.getStartDate());
        course.setEndDate(courseDTO.getEndDate());
        course.setTitle(courseDTO.getTitle());
        
        if (courseDTO.getInstructorId() != null) {
            User instructor = new User();
            instructor.setUserId(courseDTO.getInstructorId());
            course.setInstructor(instructor);
        }
        
        course.setEnrollments(new ArrayList<>());
        course.setContents(new ArrayList<>());
        course.setAssessments(new ArrayList<>());
        // Map tags and prerequisites
        course.setTags(courseDTO.getTags());
        course.setPrerequisites(courseDTO.getPrerequisites());
        return course;
    }
}