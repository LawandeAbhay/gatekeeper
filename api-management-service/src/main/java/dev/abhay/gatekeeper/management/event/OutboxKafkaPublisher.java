package dev.abhay.gatekeeper.management.event;

import dev.abhay.gatekeeper.management.entity.OutboxEvent;
import dev.abhay.gatekeeper.management.service.OutboxClaimService;
import dev.abhay.gatekeeper.management.service.OutboxUpdateService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OutboxKafkaPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final OutboxClaimService claimService;
    private final OutboxUpdateService updateService;

    @Value("${gateway.kafka.configuration-topic}")
    private String topic;

    public OutboxKafkaPublisher(
            KafkaTemplate<String, String> kafkaTemplate,
            OutboxClaimService claimService,
            OutboxUpdateService updateService) {

        this.kafkaTemplate = kafkaTemplate;
        this.claimService = claimService;
        this.updateService = updateService;
    }

    @Scheduled(fixedDelay = 5000)
    public void publishPendingEvents() {

        List<OutboxEvent> events = claimService.claimEvents();

        for (OutboxEvent event : events) {

            kafkaTemplate.send(
                    topic,
                    event.getEventKey(),
                    event.getPayload()
            ).whenComplete((result, exception) -> {

                if (exception == null) {
                    updateService.markPublished(event.getId());
                } else {
                    updateService.markFailed(event.getId());
                }
            });
        }
    }
}
