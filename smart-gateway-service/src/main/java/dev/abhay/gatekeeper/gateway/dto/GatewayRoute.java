package dev.abhay.gatekeeper.gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Service
@NoArgsConstructor
public class GatewayRoute {
    private Long id;
    private Long organizationId;
    private String routeId;
    private String name;
    private String pathPattern;
    private String targetBaseUrl;
    private String targetPathPrefix;
    private Integer requestsPerMinute;
    private Integer responseTimeoutMs;
    private boolean idempotencyEnabled;
    private boolean active;
    private Long configurationVersion;
    private Set<String> allowedMethods = new HashSet<String>();
    private List<HeaderRule> headerRules = new ArrayList<HeaderRule>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
