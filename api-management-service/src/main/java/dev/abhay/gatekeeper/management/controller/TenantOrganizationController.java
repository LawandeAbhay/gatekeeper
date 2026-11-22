package dev.abhay.gatekeeper.management.controller;

import dev.abhay.gatekeeper.management.dto.requestDto.TenantOrganizationRequest;
import dev.abhay.gatekeeper.management.dto.responseDto.OrganizationResponse;
import dev.abhay.gatekeeper.management.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant/organization")
public class TenantOrganizationController {

    private final OrganizationService organizationService;

    public TenantOrganizationController(OrganizationService organizationService){
        this.organizationService = organizationService;
    }

    @GetMapping
    public ResponseEntity<OrganizationResponse> getOwnOrganization(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(organizationService.getOwnOrganization());
    }

    @PutMapping
    public ResponseEntity<OrganizationResponse> updateOwnOrganization(
            @Valid @RequestBody TenantOrganizationRequest request){
        return ResponseEntity.status(HttpStatus.OK)
                .body(organizationService.updateOwnOrganization(request));
    }
}
