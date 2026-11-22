package dev.abhay.gatekeeper.management.service;

import dev.abhay.gatekeeper.management.dto.requestDto.OrganizationRequest;
import dev.abhay.gatekeeper.management.dto.requestDto.OrganizationStatusRequest;
import dev.abhay.gatekeeper.management.dto.requestDto.TenantAdminRequest;
import dev.abhay.gatekeeper.management.dto.requestDto.TenantOrganizationRequest;
import dev.abhay.gatekeeper.management.dto.responseDto.OrganizationResponse;
import dev.abhay.gatekeeper.management.dto.responseDto.TenantAdminResponse;
import dev.abhay.gatekeeper.management.entity.ManagementUser;
import dev.abhay.gatekeeper.management.entity.Organization;
import dev.abhay.gatekeeper.management.entity.OrganizationStatus;
import dev.abhay.gatekeeper.management.entity.Role;
import dev.abhay.gatekeeper.management.event.GatewayConfigurationEventService;
import dev.abhay.gatekeeper.management.exception.ApiException;
import dev.abhay.gatekeeper.management.repository.ManagementUserRepository;
import dev.abhay.gatekeeper.management.repository.OrganizationRepository;
import dev.abhay.gatekeeper.management.repository.RoleRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final ManagementUserRepository managementUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantContext tenantContext;
    private final AuditService auditService;
    private final GatewayConfigurationEventService gatewayConfigurationEventService;

    public OrganizationService(OrganizationRepository organizationRepository,
                               ManagementUserRepository managementUserRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder,
                               TenantContext tenantContext, AuditService auditService,
                               GatewayConfigurationEventService gatewayConfigurationEventService){
        this.organizationRepository = organizationRepository;
        this.managementUserRepository = managementUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantContext = tenantContext;
        this.auditService = auditService;
        this.gatewayConfigurationEventService = gatewayConfigurationEventService;
    }

    @Transactional
    public OrganizationResponse create(OrganizationRequest request){
        long startedAt = System.nanoTime();
        checkUnique(request.getName(), request.getSlug(), null);

        Organization organization = new Organization();
        organization.setName(request.getName());
        organization.setSlug(request.getSlug());
        organization.setStatus(OrganizationStatus.PENDING);
        organization.setCreatedAt(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());

        organizationRepository.save(organization);

        auditService.record(organization,"CREATE_ORGANIZATION", "ORGANIZATION",
                organization.getId().toString(), startedAt, "Organization created with status as PENDING");
        return OrganizationResponse.from(organization);

    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAll() {
        List<OrganizationResponse> response = new ArrayList<>();

        for(Organization organization : organizationRepository.findByStatusNot(OrganizationStatus.DELETED)){
            response.add(OrganizationResponse.from(organization));
        }
        return response;
    }

    @Transactional(readOnly = true)
    public OrganizationResponse get(Long id) {
        return OrganizationResponse.from(getOrganization(id));
    }

    @Transactional
    public OrganizationResponse update(Long id, OrganizationRequest request) {
        long startedAt = System.nanoTime();
        Organization organization = getOrganization(id);

        checkUnique(request.getName(), request.getSlug(), id);

        organization.setName(request.getName());
        organization.setSlug(request.getSlug());
        organization.setUpdatedAt(LocalDateTime.now());

        organizationRepository.save(organization);

        auditService.record(organization,"UPDATED_ORGANIZATION", "ORGANIZATION",
                organization.getId().toString(), startedAt, "Organization name and slug updated");
        gatewayConfigurationEventService.publish("ORGANIZATION_UPDATED",
                organization.getId(), null, null);

        return OrganizationResponse.from(organization);
    }

    @Transactional
    public OrganizationResponse updateStaus(Long id, OrganizationStatusRequest request){
        long startedAt = System.nanoTime();
        Organization organization = getOrganization(id);

        if(request.getStatus() == OrganizationStatus.DELETED) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Use DELETE to soft-delete an organization");
        }

        organization.setStatus(request.getStatus());
        organization.setUpdatedAt(LocalDateTime.now());

        auditService.record(organization,"CHANGE_ORGANIZATION_STATUS", "ORGANIZATION",
                organization.getId().toString(), startedAt, "Organization staus changed to: "+ request.getStatus());
        gatewayConfigurationEventService.publish("ORGANIZATION_" + request.getStatus(),
                organization.getId(), null, null);
        return OrganizationResponse.from(organization);
    }

    @Transactional
    public void delete(Long id) {
        long startedAt = System.nanoTime();

        Organization organization = getOrganization(id);
        organization.setStatus(OrganizationStatus.DELETED);
        organization.setDeletedAt(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());

        auditService.record(organization,"DELETE_ORGANIZATION", "ORGANIZATION",
                organization.getId().toString(), startedAt, "Organization deleted");

        gatewayConfigurationEventService.publish("ORGANIZATION_DELETED",
                organization.getId(), null, null);
    }

    @Transactional
    public TenantAdminResponse createTenantAdmin(Long id, @Valid TenantAdminRequest request) {
        long startedAt = System.nanoTime();
        Organization organization = getOrganization(id);

        if(managementUserRepository.findByOrganizationId(id).isPresent()){
            throw new ApiException(HttpStatus.CONFLICT,
                    "This organization already has a tenant administrator");
        }

        if(managementUserRepository.existsByUsername(request.getUsername())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
        }

        Role role = roleRepository.findByName("TENANT_ADMIN")
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "TENANT_ADMIN role is missing"));

        ManagementUser user = new ManagementUser();
        user.setOrganization(organization);
        user.setRole(role);
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(request.isEnabled());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        managementUserRepository.save(user);

        auditService.record(organization, "CREATE_TENANT_ADMIN", "TENANT_ADMIN",
                user.getId().toString(), startedAt, "Tenant administrator created");

        return TenantAdminResponse.from(user);
    }

    @Transactional(readOnly = true)
    public TenantAdminResponse getTenantAdmin(Long organizationId) {
        return TenantAdminResponse.from(getTenantAdminEntity(organizationId));
    }

    @Transactional
    public TenantAdminResponse updateTenantAdmin(Long organizationId, TenantAdminRequest request) {
        long startedAt = System.nanoTime();
        ManagementUser user = getTenantAdminEntity(organizationId);

        if(!user.getUsername().equals(request.getUsername())
                && managementUserRepository.existsByUsername(request.getUsername())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
        }

        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(request.isEnabled());
        user.setUpdatedAt(LocalDateTime.now());

        auditService.record(user.getOrganization(), "UPDATE_TENANT_ADMIN", "TENANT_ADMIN",
                user.getId().toString(), startedAt, "Tenant administrator updated");

        return TenantAdminResponse.from(user);
    }

    @Transactional
    public void deleteTenantAdmin(Long organizationId) {
        long startedAt = System.nanoTime();

        ManagementUser user = getTenantAdminEntity(organizationId);

        auditService.record(user.getOrganization(), "DELETE_TENANT_ADMIN", "TENANT_ADMIN",
                user.getId().toString(), startedAt, "Tenant administrator deleted");

        managementUserRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOwnOrganization() {
        Organization organization = tenantContext.getOrganization();
        return OrganizationResponse.from(organization);
    }

    @Transactional
    public OrganizationResponse updateOwnOrganization(@Valid TenantOrganizationRequest request) {
        long startedAt = System.nanoTime();
        Organization organization = tenantContext.getOrganization();
        if(!organization.getName().equalsIgnoreCase(request.getName())
                && organizationRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ApiException(HttpStatus.CONFLICT, "Organization name already exists");
        }
        organization.setName(request.getName());
        organization.setUpdatedAt(LocalDateTime.now());

        auditService.record(organization, "UPDATE_OWN_ORGANIZATION", "ORGANIZATION",
                organization.getId().toString(), startedAt, "Organization name updated");

        return OrganizationResponse.from(organization);
    }

    private Organization getOrganization(Long id) {
        return organizationRepository.findByIdAndStatusNot(id, OrganizationStatus.DELETED)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    private void checkUnique(String name, String slug, Long currentId) {
        if(organizationRepository.existsByNameIgnoreCase(name)) {
            Organization current = currentId == null ?
                    null : organizationRepository.findById(currentId).orElse(null);

            if(current == null || !current.getName().equalsIgnoreCase(name)) {
                throw new ApiException(HttpStatus.CONFLICT, "Organization name already exists");
            }
        }

        if(organizationRepository.existsBySlugIgnoreCase(slug)) {
            Organization current = currentId == null ?
                    null : organizationRepository.findById(currentId).orElse(null);

            if(current == null || !current.getSlug().equalsIgnoreCase(slug)) {
                throw new ApiException(HttpStatus.CONFLICT, "Organization slug already exists");
            }
        }
    }

    private ManagementUser getTenantAdminEntity(Long organizationId) {
        getOrganization(organizationId);
        return managementUserRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tenant administrator not found"));
    }
}
