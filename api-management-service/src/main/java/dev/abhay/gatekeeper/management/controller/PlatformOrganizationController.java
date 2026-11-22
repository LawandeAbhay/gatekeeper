package dev.abhay.gatekeeper.management.controller;

import dev.abhay.gatekeeper.management.dto.requestDto.OrganizationRequest;
import dev.abhay.gatekeeper.management.dto.requestDto.OrganizationStatusRequest;
import dev.abhay.gatekeeper.management.dto.requestDto.TenantAdminRequest;
import dev.abhay.gatekeeper.management.dto.responseDto.OrganizationResponse;
import dev.abhay.gatekeeper.management.dto.responseDto.TenantAdminResponse;
import dev.abhay.gatekeeper.management.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/platform/organizations")
public class PlatformOrganizationController {

    private final OrganizationService organizationService;

    public PlatformOrganizationController(OrganizationService organizationService){
        this.organizationService=organizationService;
    }

    //Platform-admin CRUD on organizations

    //1. Create organization
    @PostMapping
    public ResponseEntity<OrganizationResponse> create(@Valid @RequestBody OrganizationRequest request){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(organizationService.create(request));
    }

    //2. Get All Organizations
    @GetMapping
    public ResponseEntity<List<OrganizationResponse>> getAll(){
        return ResponseEntity.status(HttpStatus.OK)
                .body(organizationService.getAll());
    }

    //3. Get One Organization
    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponse> get(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK)
                .body(organizationService.get(id));
    }

    //4. Update Organization
    @PutMapping("/{id}")
    public ResponseEntity<OrganizationResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody OrganizationRequest request){
        return ResponseEntity.status(HttpStatus.OK)
                .body(organizationService.update(id, request));
    }

    //5. Patch Organization
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrganizationResponse> updateStatus(@PathVariable Long id,
                                                             @Valid @RequestBody OrganizationStatusRequest status){
        return ResponseEntity.status(HttpStatus.OK)
                .body(organizationService.updateStaus(id,status));
    }

    //6. Delete Organization (Soft Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        organizationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    //CRUD for tenant admins

    //1. Create tenant admin
    @PostMapping("/{organizationId}/tenant-admin")
    public ResponseEntity<TenantAdminResponse> createTenantAdmin(@PathVariable Long organizationId,
                                                                 @Valid @RequestBody TenantAdminRequest request){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(organizationService.createTenantAdmin(organizationId, request));
    }

    //2. Get tenant-admin
    @GetMapping("/{organizationId}/tenant-admin")
    public ResponseEntity<TenantAdminResponse> getTenantAdmin(@PathVariable Long organizationId) {
        return ResponseEntity.ok(organizationService.getTenantAdmin(organizationId));
    }

    //3 update tenant-admin
    @PutMapping("/{organizationId}/tenant-admin")
    public ResponseEntity<TenantAdminResponse> updateTenantAdmin(@PathVariable Long organizationId,
                                                                 @Valid @RequestBody TenantAdminRequest request) {
        return ResponseEntity.ok(organizationService.updateTenantAdmin(organizationId, request));
    }

    //4. delete tenant admin
    @DeleteMapping("/{organizationId}/tenant-admin")
    public ResponseEntity<Void> deleteTenantAdmin(@PathVariable Long organizationId) {
        organizationService.deleteTenantAdmin(organizationId);
        return ResponseEntity.noContent().build();
    }



}
