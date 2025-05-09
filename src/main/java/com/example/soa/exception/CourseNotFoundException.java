package com.example.soa.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CourseNotFoundException extends RuntimeException {
    private static final Logger logger = LoggerFactory.getLogger(CourseNotFoundException.class);

    public CourseNotFoundException(String message) {
        super(message);
        logger.error(message);
    }
}