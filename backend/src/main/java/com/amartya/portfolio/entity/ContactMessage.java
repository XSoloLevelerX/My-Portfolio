package com.amartya.portfolio.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "contact_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(name = "session_hash")
    private String sessionHash;

    @Column(nullable = false)
    @Builder.Default
    private Boolean handled = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
