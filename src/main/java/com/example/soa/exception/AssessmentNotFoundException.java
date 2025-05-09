package com.example.soa.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AssessmentNotFoundException extends RuntimeException {
    private static final Logger logger = LoggerFactory.getLogger(AssessmentNotFoundException.class);

    public AssessmentNotFoundException(String message) {
        super(message);
        logger.error(message);
    }
}