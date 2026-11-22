package dev.abhay.gatekeeper.management.repository;

import dev.abhay.gatekeeper.management.entity.Organization;
import dev.abhay.gatekeeper.management.entity.OrganizationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    boolean existsByNameIgnoreCase(String name);
    boolean existsBySlugIgnoreCase(String slug);
    List<Organization> findByStatusNot(OrganizationStatus status);
    Optional<Organization> findByIdAndStatusNot(Long id, OrganizationStatus status);
}
