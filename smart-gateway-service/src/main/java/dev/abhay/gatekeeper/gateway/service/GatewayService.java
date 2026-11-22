package dev.abhay.gatekeeper.gateway.service;

import dev.abhay.gatekeeper.gateway.dto.CompiledRoute;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class GatewayService {

    private final RouteRegistry routeRegistry;

    public GatewayService(RouteRegistry routeRegistry) {
        this.routeRegistry = routeRegistry;
    }

    public ResponseEntity<byte[]> handle(HttpServletRequest request) {

        Long startedAt = System.nanoTime();
        String correlationId = getCorrelationId(request);
        //1. Match with the routeRegistry and get the compiledRoute for incoming http request

        Optional<CompiledRoute> mactchesRoute = routeRegistry.find(request.getRequestURI());

        //2. Apply rate limiting routes from the gateway routs

        //3. Idempotent api checking if the user has enabled the checking of the idempotency

        //4. Header rules application based onto the configurations

        //5. Redirect our request to the target

        //6. Apply header rules to the response received

        //7. store response if idempotency was enabled

        //8. return response to client

        return null;
    }

    private String getCorrelationId(HttpServletRequest request){
        String correlationId = request.getHeader("X-Correlation-ID");

        if(correlationId== null || correlationId.trim().isEmpty()){
            return UUID.randomUUID().toString();
        }
        return correlationId;
    }
}
