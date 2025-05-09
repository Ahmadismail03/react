package com.example.soa.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    /**
     * Send a password reset email with a reset link
     * 
     * @param to The recipient's email address
     * @param resetLink The password reset link
     * @param username The recipient's username
     */
    public void sendPasswordResetEmail(String to, String resetLink, String username) {
        try {
            logger.info("Preparing to send password reset email to: {}", to);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            Context context = new Context();
            context.setVariable("resetLink", resetLink);
            context.setVariable("username", username);
            
            String htmlContent = templateEngine.process("password-reset-email", context);
            
            helper.setTo(to);
            helper.setSubject("Password Reset Instructions");
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Password reset email sent successfully to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to: {}", to, e);
            // Don't throw the exception, just log it
        }
    }
    
    /**
     * Send a generic email with a custom template
     * 
     * @param to The recipient's email address
     * @param subject The email subject
     * @param template The template name (without extension)
     * @param context The context containing variables for the template
     */
    public void sendEmail(String to, String subject, String template, Context context) {
        try {
            logger.info("Preparing to send email to: {}, subject: {}, template: {}", to, subject, template);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            String htmlContent = templateEngine.process(template, context);
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send email to: {}, subject: {}", to, subject, e);
            // Don't throw the exception, just log it
        }
    }
}