package com.amartya.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** The detail view. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDTO {

    private String slug;
    private String title;
    private String tagline;
    private String description;
    private String domain;
    private List<String> stack;
    private String liveUrl;
    private String repoUrl;
    private String writeupUrl;
    private String posterUrl;
    private String backdropUrl;
    private String trailerUrl;
    private String status;
    private boolean featured;
    private short complexity;
    private String badge;
    private String layerLabel;
    private LocalDate releasedAt;
    private BigDecimal trendingScore;
}
