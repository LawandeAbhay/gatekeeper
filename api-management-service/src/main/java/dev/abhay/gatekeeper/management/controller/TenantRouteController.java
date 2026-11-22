package dev.abhay.gatekeeper.management.controller;

import dev.abhay.gatekeeper.management.dto.requestDto.RouteRequest;
import dev.abhay.gatekeeper.management.dto.requestDto.RouteStatusRequest;
import dev.abhay.gatekeeper.management.dto.responseDto.AuditRecordResponse;
import dev.abhay.gatekeeper.management.dto.responseDto.RouteResponse;
import dev.abhay.gatekeeper.management.dto.responseDto.RouteVersionResponse;
import dev.abhay.gatekeeper.management.service.AuditService;
import dev.abhay.gatekeeper.management.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenant")
public class TenantRouteController {

    private final RouteService routeService;
    private final AuditService auditService;

    public  TenantRouteController(RouteService routeService, AuditService auditService){
        this.routeService = routeService;
        this.auditService = auditService;
    }

    //CRUD operations on the api route

    //1. CREATE Route
    @PostMapping("/route")
    public ResponseEntity<RouteResponse> addRoute(@RequestBody @Valid RouteRequest request){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(routeService.addRoute(request));
    }

    //2  GET all routes
    @GetMapping("/routes")
    public ResponseEntity<List<RouteResponse>> getAllRoutes(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(routeService.getAllRoutes());
    }

    //3. GET rout by Id
    @GetMapping("/route/{id}")
    public ResponseEntity<RouteResponse> getRoute(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(routeService.getRoute(id));
    }

    //4. UPDATE route
    @PutMapping("/route/{id}")
    public ResponseEntity<RouteResponse> update(@PathVariable Long id, @Valid @RequestBody RouteRequest request){
        return ResponseEntity.status(HttpStatus.OK)
                .body(routeService.updateRoute(id, request));
    }

    //5. Update the active status
    @PatchMapping("/route/{id}/status")
    public ResponseEntity<RouteResponse> updateRouteStatus(@PathVariable Long id, @Valid @RequestBody RouteStatusRequest request){
        return ResponseEntity.status(HttpStatus.OK)
                .body(routeService.updateRouteStatus(id, request));
    }

    //6 Delete the route
    @DeleteMapping("/route/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable  Long id){
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }

    //7. Get all route versions
    @GetMapping("/route-versions/{routeId}")
    public ResponseEntity<List<RouteVersionResponse>> getAllVersions(@PathVariable String routeId){
        return ResponseEntity.status(HttpStatus.OK)
                .body(routeService.getAllVersions(routeId));
    }

    // 8. Get all audit records
    @GetMapping("/audit-records")
    public ResponseEntity<List<AuditRecordResponse>> getAllAuditRecordResponse(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(auditService.getAllAudits());
    }


}
