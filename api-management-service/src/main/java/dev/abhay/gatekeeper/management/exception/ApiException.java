package dev.abhay.gatekeeper.management.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
@Getter
@Setter
public class ApiException extends RuntimeException{
    private final HttpStatus status;

    public ApiException(HttpStatus status, String message){
        super(message);
        this.status=status;
    }

}
