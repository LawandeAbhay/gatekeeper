package dev.abhay.gatekeeper.gateway.controller;

import dev.abhay.gatekeeper.gateway.dto.responseDto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class HelloController {

    private final String serviceName;
    private final String serviceDescription;

    public HelloController(@Value("${info.app.name}") String serviceName,
                           @Value("${info.app.description}") String serviceDescription){
        this.serviceName=serviceName;
        this.serviceDescription=serviceDescription;
    }

    @GetMapping
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(
                new HealthResponse(serviceName, serviceDescription, "UP"));
    }


}
