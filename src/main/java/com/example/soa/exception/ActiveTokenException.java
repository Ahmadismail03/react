package com.example.soa.exception;

public class ActiveTokenException extends RuntimeException {
    public ActiveTokenException(String message) {
        super(message);
    }
}
