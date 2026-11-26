package dev.abhay.gatekeeper.management.service;

import dev.abhay.gatekeeper.management.entity.OutboxEvent;
import dev.abhay.gatekeeper.management.entity.OutboxStatus;
import dev.abhay.gatekeeper.management.repository.OutboxEventRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OutboxClaimService {
    private final OutboxEventRepository repository;

    public OutboxClaimService(OutboxEventRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public List<OutboxEvent> claimEvents() {

        List<OutboxEvent> events = repository.claimPendingEvents();

        LocalDateTime claimedUntil = LocalDateTime.now().plusMinutes(2);

        for (OutboxEvent event : events) {
            event.setStatus(OutboxStatus.PROCESSING);
            event.setClaimedUntil(claimedUntil);
        }

        return events;
    }
}
