package com.amartya.portfolio.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** One engagement signal. This is what "trending" is computed from. */
@Entity
@Table(name = "project_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    /** Salted hash of the caller's session. Raw IPs are never stored. */
    @Column(name = "session_hash")
    private String sessionHash;

    private String referrer;

    @Column(name = "occurred_at", insertable = false, updatable = false)
    private Instant occurredAt;
}
