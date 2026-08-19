package com.amartya.portfolio.service;

import com.amartya.portfolio.dto.ProjectDTO;
import com.amartya.portfolio.dto.ProjectSummaryDTO;
import com.amartya.portfolio.dto.RowDTO;
import com.amartya.portfolio.entity.Project;
import com.amartya.portfolio.exception.ResourceNotFoundException;
import com.amartya.portfolio.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private static final String ARCHIVED = "ARCHIVED";
    private static final int ROW_LIMIT = 12;

    /** Shelf order matters: this is the order a visitor scrolls through. */
    private static final Map<String, String> DOMAIN_ROWS = new LinkedHashMap<>() {{
        put("AI", "AI & Agents");
        put("SECURITY", "Security");
        put("GRAPHICS", "3D & Graphics");
        put("SYSTEMS", "Systems");
        put("ML", "ML & Vision");
    }};

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ProjectSummaryDTO> findAll(String domain, String status) {
        List<Project> projects;
        if (domain != null && !domain.isBlank()) {
            projects = projectRepository.findByDomainAndStatusNotOrderByReleasedAtDesc(
                    domain.toUpperCase(), ARCHIVED);
        } else if (status != null && !status.isBlank()) {
            projects = projectRepository.findByStatusOrderByReleasedAtDesc(status.toUpperCase());
        } else {
            projects = projectRepository.findByStatusNotOrderByReleasedAtDesc(ARCHIVED);
        }
        return projects.stream().map(this::mapToSummary).toList();
    }

    @Transactional(readOnly = true)
    public ProjectDTO findBySlug(String slug) {
        return projectRepository.findBySlug(slug)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("No project with slug '" + slug + "'"));
    }

    /**
     * The entire home page in one call. Empty shelves are dropped rather than rendered
     * as an empty row, so the page never shows a heading with nothing under it.
     */
    @Transactional(readOnly = true)
    public List<RowDTO> buildRows() {
        List<RowDTO> rows = new ArrayList<>();

        addRow(rows, "trending", "Trending Now",
                projectRepository.findByStatusNotOrderByTrendingScoreDesc(ARCHIVED));
        addRow(rows, "new", "New Releases",
                projectRepository.findByStatusNotOrderByReleasedAtDesc(ARCHIVED));
        addRow(rows, "featured", "Amartya's Picks",
                projectRepository.findByFeaturedTrueAndStatusNotOrderByReleasedAtDesc(ARCHIVED));
        addRow(rows, "building", "Currently Building",
                projectRepository.findByStatusOrderByReleasedAtDesc("WIP"));

        DOMAIN_ROWS.forEach((key, title) -> addRow(rows, key.toLowerCase(), title,
                projectRepository.findByDomainAndStatusNotOrderByReleasedAtDesc(key, ARCHIVED)));

        return rows;
    }

    private void addRow(List<RowDTO> rows, String key, String title, List<Project> projects) {
        if (projects.isEmpty()) {
            return;
        }
        rows.add(RowDTO.builder()
                .key(key)
                .title(title)
                .items(projects.stream().limit(ROW_LIMIT).map(this::mapToSummary).toList())
                .build());
    }

    private ProjectSummaryDTO mapToSummary(Project p) {
        return ProjectSummaryDTO.builder()
                .slug(p.getSlug())
                .title(p.getTitle())
                .tagline(p.getTagline())
                .domain(p.getDomain())
                .stack(p.getStack())
                .liveUrl(p.getLiveUrl())
                .repoUrl(p.getRepoUrl())
                .status(p.getStatus())
                .featured(Boolean.TRUE.equals(p.getFeatured()))
                .complexity(p.getComplexity())
                .badge(badgeFor(p.getComplexity()))
                .releasedAt(p.getReleasedAt())
                .trendingScore(p.getTrendingScore())
                .posterUrl(p.getPosterUrl())
                .backdropUrl(p.getBackdropUrl())
                .build();
    }

    private ProjectDTO mapToDTO(Project p) {
        return ProjectDTO.builder()
                .slug(p.getSlug())
                .title(p.getTitle())
                .tagline(p.getTagline())
                .description(p.getDescription())
                .domain(p.getDomain())
                .stack(p.getStack())
                .liveUrl(p.getLiveUrl())
                .repoUrl(p.getRepoUrl())
                .writeupUrl(p.getWriteupUrl())
                .posterUrl(p.getPosterUrl())
                .backdropUrl(p.getBackdropUrl())
                .trailerUrl(p.getTrailerUrl())
                .status(p.getStatus())
                .featured(Boolean.TRUE.equals(p.getFeatured()))
                .complexity(p.getComplexity())
                .badge(badgeFor(p.getComplexity()))
                .layerLabel(layerFor(p.getDomain()))
                .releasedAt(p.getReleasedAt())
                .trendingScore(p.getTrendingScore())
                .build();
    }

    /** Netflix-style maturity rating, standing in for project ambition. */
    private String badgeFor(Short complexity) {
        if (complexity == null) {
            return "SDE-2";
        }
        return switch (complexity) {
            case 1 -> "SDE-1";
            case 3 -> "SDE-3";
            default -> "SDE-2";
        };
    }

    private String layerFor(String domain) {
        if (domain == null) {
            return "Systems";
        }
        return switch (domain) {
            case "AI" -> "AI & Agents";
            case "SECURITY" -> "Security";
            case "GRAPHICS" -> "3D & Graphics";
            case "ML" -> "ML & Vision";
            case "WEB" -> "Web";
            default -> "Systems";
        };
    }
}
