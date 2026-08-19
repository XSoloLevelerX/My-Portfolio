package com.amartya.portfolio.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * A "title" in the catalogue.
 *
 * created_at / updated_at are owned by the database (defaults plus the touch_updated_at
 * trigger from V1), so they are mapped read-only here. Adding @PrePersist/@PreUpdate on
 * top would mean two auditing mechanisms for the same columns.
 */
@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    private String tagline;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private String domain;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "stack", columnDefinition = "text[]")
    @Builder.Default
    private List<String> stack = new ArrayList<>();

    @Column(name = "live_url")
    private String liveUrl;

    @Column(name = "repo_url")
    private String repoUrl;

    @Column(name = "writeup_url")
    private String writeupUrl;

    @Column(name = "poster_url")
    private String posterUrl;

    @Column(name = "backdrop_url")
    private String backdropUrl;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(nullable = false)
    @Builder.Default
    private String status = "WIP";

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @Column(nullable = false)
    @Builder.Default
    private Short complexity = 2;

    @Column(name = "released_at")
    private LocalDate releasedAt;

    /** Written only by recompute_trending_scores(); never by the application. */
    @Column(name = "trending_score", nullable = false, updatable = false)
    @Builder.Default
    private BigDecimal trendingScore = BigDecimal.ZERO;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;
}
