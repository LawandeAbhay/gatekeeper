package dev.abhay.gatekeeper.management.dto.requestDto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantOrganizationRequest {
    @NotBlank
    private String name;
}
