package com.example.soa.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DuplicateEnrollmentException extends RuntimeException {
    private static final Logger logger = LoggerFactory.getLogger(DuplicateEnrollmentException.class);

    public DuplicateEnrollmentException(String message) {
        super(message);
        logger.error(message);
    }
}