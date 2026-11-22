package dev.abhay.gatekeeper.management.repository;

import dev.abhay.gatekeeper.management.entity.RouteConfigurationVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteConfigurationVersionRepository extends JpaRepository<RouteConfigurationVersion, Long> {
    List<RouteConfigurationVersion> findAllByRouteIdAndOrganizationIdOrderByVersionNumberDesc(String routId, Long organizationId);
}
