package com.example.soa.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ContentNotFoundException extends RuntimeException {
    private static final Logger logger = LoggerFactory.getLogger(ContentNotFoundException.class);

    public ContentNotFoundException(String message) {
        super(message);
        logger.error(message);
    }
}