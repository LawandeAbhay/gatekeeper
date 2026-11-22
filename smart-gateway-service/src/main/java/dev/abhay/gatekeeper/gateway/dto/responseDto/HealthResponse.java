package dev.abhay.gatekeeper.gateway.dto.responseDto;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public class HealthResponse {

    private String serviceName;
    private String serviceDescription;
    private String appStatus;
}
