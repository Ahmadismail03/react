package com.example.soa;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SoaApplication {
    private static final Logger logger = LoggerFactory.getLogger(SoaApplication.class);

    public static void main(String[] args) {
        logger.info("Starting SoaApplication...");
        SpringApplication.run(SoaApplication.class, args);
    }
}
