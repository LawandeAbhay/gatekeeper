package dev.abhay.gatekeeper.management.service;

import dev.abhay.gatekeeper.management.entity.OutboxEvent;
import dev.abhay.gatekeeper.management.entity.OutboxStatus;
import dev.abhay.gatekeeper.management.repository.OutboxEventRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OutboxUpdateService {

    private final OutboxEventRepository repository;

    public OutboxUpdateService(OutboxEventRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void markPublished(Long id) {

        OutboxEvent event = repository.findById(id)
                .orElseThrow();

        event.setStatus(OutboxStatus.PUBLISHED);
        event.setPublishedAt(LocalDateTime.now());
        event.setClaimedUntil(null);
    }

    @Transactional
    public void markFailed(Long id) {

        OutboxEvent event = repository.findById(id)
                .orElseThrow();

        int retries = event.getRetryCount() + 1;

        event.setRetryCount(retries);
        event.setStatus(OutboxStatus.PENDING);
        event.setClaimedUntil(null);

        // Exponential backoff, capped at 5 minutes
        long delaySeconds = Math.min(
                300,
                5L * (1L << Math.min(retries - 1, 6))
        );

        event.setNextRetryAt(
                LocalDateTime.now().plusSeconds(delaySeconds)
        );
    }
}