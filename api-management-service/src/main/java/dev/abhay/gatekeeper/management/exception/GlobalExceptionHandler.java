package dev.abhay.gatekeeper.management.exception;

import dev.abhay.gatekeeper.management.dto.responseDto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException exception){
        return response(exception.getStatus(), exception.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException exception){
        Map<String, String> errors = new LinkedHashMap<>();

        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(),error.getDefaultMessage()));
        return response(HttpStatus.BAD_REQUEST, "Request Validation filed", errors);

    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception exception){
        return response(HttpStatus.BAD_REQUEST,"Unexpected Server Error", null);
    }
    private ResponseEntity<ErrorResponse> response(HttpStatus status, String message, Map<String, String> errors){
        ErrorResponse response= new ErrorResponse(status.value(), message, errors, LocalDateTime.now());
        return ResponseEntity.status(status)
                .body(response);
    }
}
