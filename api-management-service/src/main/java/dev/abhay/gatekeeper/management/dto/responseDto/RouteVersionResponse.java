package dev.abhay.gatekeeper.management.dto.responseDto;

import dev.abhay.gatekeeper.management.entity.Organization;
import dev.abhay.gatekeeper.management.entity.RouteConfigurationVersion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class RouteVersionResponse {

    private Long id;
    private String routeId;
    private Long versionNumber;
    private String changeType;
    private String configurationSnapshot;
    private LocalDateTime createdAt;

    public static RouteVersionResponse from(RouteConfigurationVersion version) {
        return new RouteVersionResponse(version.getId(), version.getRouteId(), version.getVersionNumber(),
                version.getChangeType(), version.getConfigurationSnapshot(), version.getCreatedAt());
    }
}
