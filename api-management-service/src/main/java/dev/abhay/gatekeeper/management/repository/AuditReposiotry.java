package dev.abhay.gatekeeper.management.repository;

import dev.abhay.gatekeeper.management.entity.ControlPlaneAuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditReposiotry extends JpaRepository<ControlPlaneAuditRecord, Long> {
    List<ControlPlaneAuditRecord> findAllByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

}
