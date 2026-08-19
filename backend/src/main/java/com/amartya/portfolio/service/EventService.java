package com.amartya.portfolio.service;

import com.amartya.portfolio.dto.EventRequest;
import com.amartya.portfolio.entity.Project;
import com.amartya.portfolio.entity.ProjectEvent;
import com.amartya.portfolio.exception.RateLimitedException;
import com.amartya.portfolio.exception.ResourceNotFoundException;
import com.amartya.portfolio.repository.ProjectEventRepository;
import com.amartya.portfolio.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

/**
 * Records engagement with the portfolio. This is the substitute for Vercel Web
 * Analytics, which is not enabled on any of the deployed projects.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final ProjectEventRepository eventRepository;
    private final ProjectRepository projectRepository;

    @Value("${app.events.max-per-minute:60}")
    private int maxPerMinute;

    /**
     * Fire-and-forget from the caller's perspective. A rate limit keeps one visitor
     * from inflating a project's trending score.
     */
    @Transactional
    public void record(String slug, EventRequest request, String sessionHash) {
        Project project = projectRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("No project with slug '" + slug + "'"));

        if (sessionHash != null) {
            long recent = eventRepository.countBySessionHashAndOccurredAtAfter(
                    sessionHash, Instant.now().minus(Duration.ofMinutes(1)));
            if (recent >= maxPerMinute) {
                throw new RateLimitedException("Too many events from this session. Try again shortly.");
            }
        }

        eventRepository.save(ProjectEvent.builder()
                .projectId(project.getId())
                .eventType(request.getEventType())
                .referrer(request.getReferrer())
                .sessionHash(sessionHash)
                .build());

        log.debug("Recorded {} for {}", request.getEventType(), slug);
    }
}
