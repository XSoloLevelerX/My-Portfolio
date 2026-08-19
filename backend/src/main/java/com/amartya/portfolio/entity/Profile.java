package com.amartya.portfolio.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/** Exactly one row; the singleton is enforced by a partial unique index in V1. */
@Entity
@Table(name = "profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String headline;

    @Column(columnDefinition = "text")
    private String bio;

    private String email;

    private String location;

    @Column(name = "resume_url")
    private String resumeUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "socials", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, String> socials = new HashMap<>();

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;
}
