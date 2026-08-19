package com.amartya.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** What a card on the shelf needs. Deliberately smaller than ProjectDTO. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectSummaryDTO {

    private String slug;
    private String title;
    private String tagline;
    private String domain;
    private List<String> stack;
    private String liveUrl;
    private String repoUrl;
    private String status;
    private boolean featured;
    private short complexity;
    /** SDE-1 / SDE-2 / SDE-3 — the Netflix-style maturity badge. */
    private String badge;
    private LocalDate releasedAt;
    private BigDecimal trendingScore;
    private String posterUrl;
    private String backdropUrl;
}
