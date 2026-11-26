package dev.abhay.gatekeeper.management.repository;

import dev.abhay.gatekeeper.management.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent , Long> {
    @Query(value = """
        SELECT *
        FROM outbox_events
        WHERE (
            status = 'PENDING'
            AND next_retry_at <= CURRENT_TIMESTAMP
        )
        OR (
            status = 'PROCESSING'
            AND claimed_until < CURRENT_TIMESTAMP
        )
        ORDER BY created_at
        LIMIT 50
        FOR UPDATE SKIP LOCKED
        """, nativeQuery = true)
    List<OutboxEvent> claimPendingEvents();
}
