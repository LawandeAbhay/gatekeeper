package dev.abhay.gatekeeper.management.service;

import dev.abhay.gatekeeper.management.dto.requestDto.LoginRequest;
import dev.abhay.gatekeeper.management.dto.responseDto.LoginResponse;
import dev.abhay.gatekeeper.management.entity.ManagementUser;
import dev.abhay.gatekeeper.management.entity.OrganizationStatus;
import dev.abhay.gatekeeper.management.exception.ApiException;
import dev.abhay.gatekeeper.management.repository.ManagementUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthenticationService {

    private final ManagementUserRepository managementUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long expirationSeconds;

    public AuthenticationService(ManagementUserRepository managementUserRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtEncoder jwtEncoder,
                                 @Value("${security.jwt.expiration-seconds}") long etExpirationSeconds){
        this.managementUserRepository=managementUserRepository;
        this.passwordEncoder=passwordEncoder;
        this.jwtEncoder=jwtEncoder;
        this.expirationSeconds=etExpirationSeconds;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request){
        ManagementUser user = managementUserRepository.findByUsername(request.getUsername())
                .orElseThrow(()->invalidCredentials());


        if(!user.isEnabled() || !passwordEncoder.matches(request.getPassword(),user.getPasswordHash())){
            throw new ApiException(HttpStatus.UNAUTHORIZED,"Username or password is incorrect no matches");
        }

        if(user.getOrganization()!=null && user.getOrganization().getStatus()!= OrganizationStatus.ACTIVE){
            throw new ApiException(HttpStatus.FORBIDDEN,"The Organization is not active");
        }
        Instant issuedAt = Instant.now();
        String role = user.getRole().getName();
        Long organizationId = user.getOrganization()==null ? null : user.getOrganization().getId();

        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer("gatekeeper-api-management")
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plusSeconds(expirationSeconds))
                .subject(user.getUsername())
                .claim("role", role);

        if(organizationId!=null){
            claims.claim("organizationId",organizationId);
        }

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(header,claims.build())).getTokenValue();

        return new LoginResponse(token,"Bearer",expirationSeconds,role,organizationId);

    }

    private ApiException invalidCredentials(){

        throw new ApiException(HttpStatus.UNAUTHORIZED,"User not found from the invalid api exception");
    }
}
