package dev.abhay.gatekeeper.gateway.service;

import dev.abhay.gatekeeper.gateway.dto.CompiledRoute;
import dev.abhay.gatekeeper.gateway.dto.GatewayRoute;
import org.springframework.http.server.PathContainer;
import org.springframework.stereotype.Service;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class RouteRegistry {

    private final AtomicReference<List<CompiledRoute>> routes = new AtomicReference<>(Collections.emptyList());
    private PathPatternParser parser = new PathPatternParser();

    public void replaceAll(List<GatewayRoute> gatewayRoutes){
        List<CompiledRoute> compiledRoutes = new ArrayList<>();

        if(routes!=null){
            for(GatewayRoute route : gatewayRoutes){
                PathPattern pathPattern = parser.parse(route.getPathPattern());

                compiledRoutes.add(new CompiledRoute(route, pathPattern,
                        sourcePrefix(route.getPathPattern())));
            }
        }

        Collections.sort(compiledRoutes, new Comparator<CompiledRoute>() {
            @Override
            public int compare(CompiledRoute first, CompiledRoute second) {
                return PathPattern.SPECIFICITY_COMPARATOR.compare(
                        first.getPathPattern(), second.getPathPattern()
                );
            }
        });

        routes.set(Collections.unmodifiableList(compiledRoutes));
    }

    public Optional<CompiledRoute> find(String requestPath){
        PathContainer path = PathContainer.parsePath(requestPath);

        for(CompiledRoute route : routes.get()){
            if (route.getPathPattern().matches(path)) {
                return Optional.of(route);

            }
        }
        return Optional.empty();
    }

    private String sourcePrefix(String pathPattern){
        if(pathPattern.endsWith("/**")){
            return pathPattern.substring(0, pathPattern.length()-3);
        }
        return pathPattern;
    }
}
