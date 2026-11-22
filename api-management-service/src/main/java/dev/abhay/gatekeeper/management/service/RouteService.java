package dev.abhay.gatekeeper.management.service;

import dev.abhay.gatekeeper.management.dto.requestDto.HeaderRuleRequest;
import dev.abhay.gatekeeper.management.dto.requestDto.RouteRequest;
import dev.abhay.gatekeeper.management.dto.requestDto.RouteStatusRequest;
import dev.abhay.gatekeeper.management.dto.responseDto.RouteResponse;
import dev.abhay.gatekeeper.management.dto.responseDto.RouteVersionResponse;
import dev.abhay.gatekeeper.management.entity.*;
import dev.abhay.gatekeeper.management.event.GatewayConfigurationEventService;
import dev.abhay.gatekeeper.management.exception.ApiException;
import dev.abhay.gatekeeper.management.repository.ApiRouteRepository;
import dev.abhay.gatekeeper.management.repository.RouteConfigurationVersionRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RouteService {

    private final ApiRouteRepository apiRouteRepository;
    private final RouteConfigurationVersionRepository routeConfigurationVersionRepository;
    private final TenantContext tenantContext;
    private final ObjectMapper objectMapper;
    private final AuditService auditService;
    private final GatewayConfigurationEventService gatewayConfigurationEventService;

    public RouteService(ApiRouteRepository apiRouteRepository,
                        RouteConfigurationVersionRepository routeConfigurationVersionRepository,
                        TenantContext tenantContext, ObjectMapper objectMapper, AuditService auditService,
                        GatewayConfigurationEventService gatewayConfigurationEventService){
        this.apiRouteRepository = apiRouteRepository;
        this.routeConfigurationVersionRepository = routeConfigurationVersionRepository;
        this.tenantContext = tenantContext;
        this.objectMapper = objectMapper;
        this.auditService = auditService;
        this.gatewayConfigurationEventService = gatewayConfigurationEventService;
    }

    @Transactional
    public RouteResponse addRoute(RouteRequest request) {
        long startedAt = System.nanoTime();

        Organization organization = tenantContext.getOrganization();

        validate(request, organization);

        if(apiRouteRepository.existsByOrganizationIdAndRouteId(organization.getId(), request.getRouteId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Route ID already exists for this organization");
        }

        ApiRoute apiRoute = new ApiRoute();

        apiRoute.setOrganization(organization);
        apiRoute.setConfigurationVersion(1L);
        apiRoute.setCreatedAt(LocalDateTime.now());
        apply(apiRoute, request);

        apiRouteRepository.save(apiRoute);
        saveVersion(apiRoute, "CREATED");

        auditService.record(organization, "CREATE_ROUTE",
                "API_ROUTE", apiRoute.getRouteId(), startedAt,
                "Route configuration version 1 created");

        gatewayConfigurationEventService.publish("CREATED", organization.getId(),
                apiRoute.getRouteId(), apiRoute.getConfigurationVersion());

        return RouteResponse.from(apiRoute);
    }

    @Transactional(readOnly = true)
    public List<RouteResponse> getAllRoutes() {
        Organization organization = tenantContext.getOrganization();
        List<ApiRoute> apiRoutes = apiRouteRepository.findAllByOrganizationId(organization.getId());
        List<RouteResponse> response = new ArrayList<>();
        for(ApiRoute apiRoute : apiRoutes){
            response.add(RouteResponse.from(apiRoute));
        }
        return response;
    }

    @Transactional(readOnly = true)
    public RouteResponse getRoute(Long id){
        Organization organization = tenantContext.getOrganization();
        return RouteResponse.from(getOwnRoutById(id));
    }

    @Transactional
    public RouteResponse updateRoute(Long id, RouteRequest request) {
        long startedAt = System.nanoTime();
        Organization organization  = tenantContext.getOrganization();

        ApiRoute route = getOwnRoutById(id);

        if(!route.getRouteId().equals(request.getRouteId())){
            throw new ApiException(HttpStatus.BAD_REQUEST, "routId cannot be change");
        }

        validate(request, organization);
        route.setConfigurationVersion(route.getConfigurationVersion()+1);

        apply(route, request);
        saveVersion(route, "UPDATED");

        auditService.record(organization, "UPDATE_ROUTE", "API_ROUTE",
                route.getRouteId(), startedAt, "Route configuration version " +
                        route.getConfigurationVersion() + " created");

        gatewayConfigurationEventService.publish("UPDATED", organization.getId(),
                route.getRouteId(), route.getConfigurationVersion());


        return RouteResponse.from(route);
    }

    @Transactional
    public RouteResponse updateRouteStatus(Long id, @Valid RouteStatusRequest request) {

        long startedAt = System.nanoTime();

        Organization organization = tenantContext.getOrganization();
        ApiRoute apiRoute = getOwnRoutById(id);

        apiRoute.setActive(request.getActive());
        apiRoute.setConfigurationVersion(apiRoute.getConfigurationVersion() + 1);
        apiRoute.setUpdatedAt(LocalDateTime.now());

        String changeType = request.getActive() ? "ACTIVATED" : "DEACTIVATED" ;
        String action = request.getActive() ? "ACTIVATE_ROUTE" : "DEACTIVATE_ROUTE";

        saveVersion(apiRoute, changeType);

        auditService.record(organization, action, "API_ROUTE", apiRoute.getRouteId(), startedAt,
                "Route configuration version " + apiRoute.getConfigurationVersion() + " created");

        gatewayConfigurationEventService.publish(changeType, organization.getId(),
                apiRoute.getRouteId(), apiRoute.getConfigurationVersion());

        return RouteResponse.from(apiRoute);
    }

    @Transactional
    public void deleteRoute(Long id) {
        long startedAt = System.nanoTime();
        Organization organization = tenantContext.getOrganization();
        ApiRoute apiRoute = getOwnRoutById(id);
        apiRoute.setConfigurationVersion(apiRoute.getConfigurationVersion() + 1);
        apiRoute.setUpdatedAt(LocalDateTime.now());

        saveVersion(apiRoute, "DELETED");

        auditService.record(organization, "DELETE_ROUTE", "API_ROUTE", apiRoute.getRouteId(), startedAt,
                "Final configuration saved as version " + apiRoute.getConfigurationVersion());

        gatewayConfigurationEventService.publish("DELETED", organization.getId(),
                apiRoute.getRouteId(), apiRoute.getConfigurationVersion());

        apiRouteRepository.delete(apiRoute);
    }

    @Transactional(readOnly = true)
    public List<RouteVersionResponse> getAllVersions(String routeId) {
        Organization organization = tenantContext.getOrganization();
        List<RouteConfigurationVersion> routeVersions = routeConfigurationVersionRepository.findAllByRouteIdAndOrganizationIdOrderByVersionNumberDesc(routeId, organization.getId());
        List<RouteVersionResponse> response = new ArrayList<>();
        for(RouteConfigurationVersion routeVersion : routeVersions){
            response.add(RouteVersionResponse.from(routeVersion));
        }
        return response;
    }

    //Gateway method
    @Transactional(readOnly = true)
    public List<RouteResponse> getAllActiveRoutes() {
        List<ApiRoute> apiRoutes = apiRouteRepository.findAllByActiveTrueAndOrganizationStatus(OrganizationStatus.ACTIVE);
        List<RouteResponse> response = new ArrayList<>();
        for(ApiRoute apiRoute : apiRoutes){
            response.add(RouteResponse.from(apiRoute));
        }
        return response;
    }

    private ApiRoute getOwnRoutById(Long id){
        Organization organization = tenantContext.getOrganization();
        return apiRouteRepository.findByIdAndOrganizationId(id, organization.getId())
                .orElseThrow(()->new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Api rout with the id: "+ id +" not found"
                ));
    }

    private void validate(RouteRequest request, Organization organization) {
        String tenantPrefix = "/" + organization.getSlug() + "/";

        if(!request.getPathPattern().startsWith(tenantPrefix)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "pathPattern must start with the tenant prefix " + tenantPrefix);
        }

        if(!request.getTargetPathPrefix().startsWith("/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "targetPathPrefix must start with /");
        }

        try {
            URI uri = URI.create(request.getTargetBaseUrl());
            if(!"http".equalsIgnoreCase(uri.getScheme()) && !"https".equalsIgnoreCase(uri.getScheme())) {
                throw new IllegalArgumentException();
            }
        }
        catch(IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "TargetBaseUrl must be a valid HTTP or HTTPS URL");
        }

        normalizeMethods(request.getAllowedMethods());

        for(HeaderRuleRequest rule : request.getHeaderRules()) {
            String direction = rule.getDirection().toUpperCase(Locale.ENGLISH);
            String action = rule.getAction().toUpperCase(Locale.ENGLISH);
            if(!"REQUEST".equals(direction) && !"RESPONSE".equals(direction)) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Header direction must be REQUEST or RESPONSE");
            }
            if(!"ADD".equals(action) && !"REMOVE".equals(action)) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Header action must be ADD or REMOVE");
            }
            if("ADD".equals(action) &&
                    (rule.getHeaderValue() == null || rule.getHeaderValue().trim().isEmpty())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "ADD header rules require headerValue");
            }
        }
    }
    private Set<String> normalizeMethods(Set<String> methods) {
        Set<String> normalized = new HashSet<>();
        for(String method : methods) {
            String value = method.toUpperCase(Locale.ENGLISH);
            try {
                HttpMethod.valueOf(value);
            }
            catch(IllegalArgumentException exception) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported HTTP method: " + method);
            }
            normalized.add(value);
        }
        return normalized;
    }

    private void apply(ApiRoute route, RouteRequest request) {
        route.setRouteId(request.getRouteId());
        route.setName(request.getName());
        route.setPathPattern(request.getPathPattern());
        route.setTargetBaseUrl(request.getTargetBaseUrl());
        route.setTargetPathPrefix(request.getTargetPathPrefix());
        route.setRequestsPerMinute(request.getRequestsPerMinute());
        route.setResponseTimeoutMs(request.getResponseTimeoutMs());
        route.setIdempotencyEnabled(request.isIdempotencyEnabled());
        route.setActive(request.isActive());
        route.setUpdatedAt(LocalDateTime.now());
        route.setAllowedMethods(normalizeMethods(request.getAllowedMethods()));

        route.getHeaderRules().clear();
        for(HeaderRuleRequest ruleRequest : request.getHeaderRules()) {
            RouteHeaderRule rule = new RouteHeaderRule();
            rule.setRoute(route);
            rule.setDirection(ruleRequest.getDirection().toUpperCase(Locale.ENGLISH));
            rule.setAction(ruleRequest.getAction().toUpperCase(Locale.ENGLISH));
            rule.setHeaderName(ruleRequest.getHeaderName());
            rule.setHeaderValue(ruleRequest.getHeaderValue());
            rule.setCreatedAt(LocalDateTime.now());
            rule.setUpdatedAt(LocalDateTime.now());
            route.getHeaderRules().add(rule);
        }
    }

    private void saveVersion(ApiRoute route, String changeType){
        RouteConfigurationVersion version = new RouteConfigurationVersion();

        version.setRouteId(route.getRouteId());
        version.setOrganization(route.getOrganization());
        version.setVersionNumber(route.getConfigurationVersion());
        version.setChangeType(changeType);
        version.setConfigurationSnapshot(objectMapper.writeValueAsString(RouteResponse.from(route)));
        version.setCreatedAt(LocalDateTime.now());

        this.routeConfigurationVersionRepository.save(version);
    }

}
