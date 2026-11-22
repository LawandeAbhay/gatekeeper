package dev.abhay.gatekeeper.management.service;

import dev.abhay.gatekeeper.management.dto.responseDto.AuditRecordResponse;
import dev.abhay.gatekeeper.management.entity.ControlPlaneAuditRecord;
import dev.abhay.gatekeeper.management.entity.Organization;
import dev.abhay.gatekeeper.management.repository.AuditReposiotry;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.mvc.condition.RequestConditionHolder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuditService {

    private final AuditReposiotry auditReposiotry;
    private final TenantContext tenantContext;

    public AuditService(AuditReposiotry auditReposiotry, TenantContext tenantContext) {
        this.auditReposiotry = auditReposiotry;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public void record(Organization organization, String action,
                       String resourceType, String resourceId,
                       long startedAt, String details) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = authentication == null ? "SYSTEM" : authentication.getName();

        ControlPlaneAuditRecord record = new ControlPlaneAuditRecord();

        record.setOrganization(organization);
        record.setAction(action);
        record.setActor(actor);
        record.setResourceType(resourceType);
        record.setResourceId(resourceId);
        record.setCorrelationId(getCorrelationId());
        record.setDurationMs((System.nanoTime()-startedAt)/100000);
        record.setResult("SUCCESS");
        record.setDetails(details);
        record.setCreatedAt(LocalDateTime.now());

        auditReposiotry.save(record);
    }

    @Transactional(readOnly = true)
    public List<AuditRecordResponse> getAllAudits() {
        Organization organization = tenantContext.getOrganization();
        List<ControlPlaneAuditRecord> audits = auditReposiotry.findAllByOrganizationIdOrderByCreatedAtDesc(organization.getId());

        List<AuditRecordResponse> response = new ArrayList<>();
        for(ControlPlaneAuditRecord audit :  audits){
            response.add(AuditRecordResponse.from(audit));
        }
        return response;
    }
    private String getCorrelationId() {
        if(!(RequestContextHolder.getRequestAttributes()
                instanceof ServletRequestAttributes)) {
            return null;
        }

        HttpServletRequest request = ((ServletRequestAttributes)
                RequestContextHolder.getRequestAttributes())
                .getRequest();
        return request.getHeader("X-Correlation-ID");
    }

}
