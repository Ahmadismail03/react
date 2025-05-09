# Learning Management System (LMS)

A **web-based Learning Management System (LMS)** built using **Java Spring Boot** to facilitate online learning, assessments, and progress tracking. This system supports **multiple user roles** (Admin, Instructor, Student) and provides essential features like **secure authentication (JWT/OAuth2), course management, assessments, grading, and notifications.** 

---
 
## Features  

### **User Management**  
- Supports **Admin, Instructor, and Student roles** with role-based access control (RBAC).  
- Secure **JWT/OAuth2 authentication** for login and API access.  
- Users can **register, log in, and update their profiles.**  

### **Course Management**  
- Instructors can **create, update, and delete** courses.  
- Assign instructors to courses.  
- Students can **enroll or unenroll** from courses.  
- **OTP-based attendance tracking** for lessons.  

### **Assessments & Grading**  
- **Quiz Creation:** Instructors create quizzes with various question types (MCQs, True/False, Short Answer).  
- **Assignment Submission:** Students submit assignments for grading.  
- **Auto-Grading:** Automated quiz grading with score storage.  
- **Feedback System:** Instructors provide feedback on assignments.  

### **Performance Tracking**  
- Monitor student progress via **quiz scores, assignment submissions, and attendance records.**  
- Generate **Excel reports** for student performance.  

### **Notifications System**  
- Students & Instructors receive **email notifications** for:  
  - **Course updates**  
  - **Assignment deadlines**  
  - **Grades & enrollment confirmations**  

---

## **Technical Stack**  
- **Backend:** Java **Spring Boot** (RESTful APIs)  
- **Database:** **MySQL/PostgreSQL**  
- **Authentication:** **Spring Security, JWT, OAuth2**  
- **Email Notifications:** **JavaMailSender**  
- **Excel Reports:** **Apache POI**  
- **Testing:** **JUnit 5**  
- **Build Tool:** **Maven**  

---

## **Prerequisites**  
Ensure you have the following installed before running the application:  
- **Java 17+**  
- **MySQL or PostgreSQL** (Ensure database is running)  
- **Maven** (For project dependency management)  
- **Git** (To clone the repository)  

---

## **Installation & Setup**  
1. Clone the repository:  
   ```bash
    git clone https://github.com/S25-SWER313/project-step-1-asf.git
   cd project-step-1-asf
   ```

2. Install dependencies using Maven:  
   ```bash
   mvn clean install
   ```

3. Set up the database:  
   - Create a new database in MySQL/PostgreSQL.
   - Update the `application.properties` file with your database credentials.

4. Run the application:  
   ```bash
   mvn spring-boot:run
   ```

5. Access the application:  
   - Open your browser and navigate to `http://localhost:8081`.
