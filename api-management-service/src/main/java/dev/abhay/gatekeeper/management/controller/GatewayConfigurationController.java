package dev.abhay.gatekeeper.management.controller;

import dev.abhay.gatekeeper.management.dto.responseDto.RouteResponse;
import dev.abhay.gatekeeper.management.service.RouteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/gateway/routes")
public class GatewayConfigurationController {

    private final RouteService routeService;

    public GatewayConfigurationController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public ResponseEntity<List<RouteResponse>> getAllActiveRoutes(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(routeService.getAllActiveRoutes());
    }
}
