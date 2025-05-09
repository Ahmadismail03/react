package com.example.soa.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EnrollmentNotFoundException extends RuntimeException {
    private static final Logger logger = LoggerFactory.getLogger(EnrollmentNotFoundException.class);

    public EnrollmentNotFoundException(String message) {
        super(message);
        logger.error(message);
    }
}