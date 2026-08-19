package com.amartya.portfolio.controller;

import com.amartya.portfolio.dto.EventRequest;
import com.amartya.portfolio.dto.ProjectDTO;
import com.amartya.portfolio.dto.ProjectSummaryDTO;
import com.amartya.portfolio.dto.RowDTO;
import com.amartya.portfolio.service.EventService;
import com.amartya.portfolio.service.ProjectService;
import com.amartya.portfolio.util.SessionHasher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectController {

    private final ProjectService projectService;
    private final EventService eventService;
    private final SessionHasher sessionHasher;

    @GetMapping
    public ResponseEntity<List<ProjectSummaryDTO>> list(
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String status) {
        log.info("GET /api/v1/projects - list projects: domain={} status={}", domain, status);
        return ResponseEntity.ok(projectService.findAll(domain, status));
    }

    /** The whole home page in one call, so the shelf never fans out to six requests. */
    @GetMapping("/rows")
    public ResponseEntity<List<RowDTO>> rows() {
        log.info("GET /api/v1/projects/rows - build catalogue shelves");
        return ResponseEntity.ok(projectService.buildRows());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProjectDTO> bySlug(@PathVariable String slug) {
        log.info("GET /api/v1/projects/{} - fetch project detail", slug);
        return ResponseEntity.ok(projectService.findBySlug(slug));
    }

    /** Engagement signal. 202 because the caller should never wait on this. */
    @PostMapping("/{slug}/events")
    public ResponseEntity<Map<String, String>> recordEvent(
            @PathVariable String slug,
            @Valid @RequestBody EventRequest request,
            HttpServletRequest httpRequest) {
        log.info("POST /api/v1/projects/{}/events - record {}", slug, request.getEventType());
        eventService.record(slug, request, sessionHasher.hash(httpRequest));
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("status", "recorded"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "resource", "projects"));
    }
}
