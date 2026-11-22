package dev.abhay.gatekeeper.gateway.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

@Getter
@Service
@NoArgsConstructor
public class HeaderRule {
    private Long id;
    private String direction;
    private String action;
    private String headerName;
    private String headerValue;
}
