package dev.abhay.gatekeeper.management.repository;

import dev.abhay.gatekeeper.management.entity.ApiRoute;
import dev.abhay.gatekeeper.management.entity.OrganizationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiRouteRepository extends JpaRepository<ApiRoute, Long> {

    boolean existsByOrganizationIdAndRouteId(Long organizationId, String routeId);

    List<ApiRoute> findAllByOrganizationId(Long organizationId);

    Optional<ApiRoute> findByIdAndOrganizationId(Long id,Long organizationId);

    List<ApiRoute> findAllByActiveTrueAndOrganizationStatus(OrganizationStatus status);
}
