package com.example.soa.Repository;

import com.example.soa.Model.Enrollment;
import com.example.soa.Model.User;
import com.example.soa.Model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByCourse_CourseId(Long courseId);

    Optional<Enrollment> findByStudentAndCourse(User student, Course course);
    
    Optional<Enrollment> findByStudent_UserIdAndCourse_CourseId(Long studentId, Long courseId);
    
    List<Enrollment> findByStudent_UserId(Long studentId);
}
