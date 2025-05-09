package com.example.soa.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", java.time.LocalDateTime.now());
        
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR; // Default status

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            httpStatus = HttpStatus.valueOf(statusCode);
            
            switch(statusCode) {
                case 404:
                    errorDetails.put("message", "The requested resource was not found");
                    break;
                case 403:
                    errorDetails.put("message", "Access to this resource is forbidden");
                    break;
                case 401:
                    errorDetails.put("message", "Authentication is required to access this resource");
                    break;
                case 400:
                    errorDetails.put("message", "Invalid request parameters");
                    break;
                case 500:
                    errorDetails.put("message", "An internal server error occurred");
                    break;
                default:
                    errorDetails.put("message", "An unexpected error occurred");
            }
        } else {
            errorDetails.put("message", "An unexpected error occurred");
        }

        errorDetails.put("status", httpStatus.value());
        errorDetails.put("error", httpStatus.getReasonPhrase());
        
        if (message != null) {
            errorDetails.put("details", message);
        }

        if (exception != null && httpStatus == HttpStatus.INTERNAL_SERVER_ERROR) {
            errorDetails.put("exception", exception.toString());
        }

        return new ResponseEntity<>(errorDetails, httpStatus);
    }
}