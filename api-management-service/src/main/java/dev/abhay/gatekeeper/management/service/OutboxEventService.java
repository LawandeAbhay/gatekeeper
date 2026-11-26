package dev.abhay.gatekeeper.management.service;

import dev.abhay.gatekeeper.management.entity.OutboxEvent;
import dev.abhay.gatekeeper.management.entity.OutboxStatus;
import dev.abhay.gatekeeper.management.event.GatewayConfigurationChangeEvent;
import dev.abhay.gatekeeper.management.exception.ApiException;
import dev.abhay.gatekeeper.management.repository.OutboxEventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class OutboxEventService {

    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    public OutboxEventService(OutboxEventRepository outboxEventRepository, ObjectMapper objectMapper) {
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
    }

    public void saveEvent(
            String changeType,
            Long organizationId,
            String routeId,
            Long configurationVersion) {
        try {
            String eventId = UUID.randomUUID().toString();

            GatewayConfigurationChangeEvent event =
                    new GatewayConfigurationChangeEvent(
                            eventId,
                            "GATEWAY_CONFIGURATION_CHANGED",
                            changeType,
                            organizationId,
                            routeId,
                            configurationVersion,
                            LocalDateTime.now()
                    );

            String key = organizationId + ":" + (routeId == null ? "organization" : routeId);

            OutboxEvent outbox = new OutboxEvent();

            outbox.setEventId(eventId);
            outbox.setAggregateType("API_ROUTE");
            outbox.setAggregateId(organizationId + ":" + (routeId == null ? "organization" : routeId));
            outbox.setEventType(event.getEventType());
            outbox.setEventKey(key);
            outbox.setPayload(objectMapper.writeValueAsString(event));
            outbox.setStatus(OutboxStatus.PENDING);
            outbox.setRetryCount(0);
            outbox.setCreatedAt(LocalDateTime.now());
            outbox.setNextRetryAt(LocalDateTime.now());

            outboxEventRepository.save(outbox);

        } catch (Exception exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,"Failed to create outbox event");
        }
    }
}
