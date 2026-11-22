package dev.abhay.gatekeeper.management.dto.requestDto;

import dev.abhay.gatekeeper.management.entity.OrganizationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class OrganizationStatusRequest {

    @NotNull(message = "Organization status is required")
    private OrganizationStatus status;
}
