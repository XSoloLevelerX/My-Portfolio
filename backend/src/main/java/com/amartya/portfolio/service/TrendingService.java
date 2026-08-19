package com.amartya.portfolio.service;

import com.amartya.portfolio.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Keeps projects.trending_score current.
 *
 * The formula itself lives in the SQL function recompute_trending_scores() (migration
 * V3) rather than here, so there is exactly one definition of "trending" and it still
 * works if this service is asleep on the free tier. This class only schedules it.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrendingService {

    private final ProjectRepository projectRepository;

    /** 03:00 daily: roll yesterday's events up, then rescore. */
    @Scheduled(cron = "${app.trending.cron:0 0 3 * * *}")
    @Transactional
    public void refresh() {
        log.info("Trending refresh starting");
        projectRepository.rollupDailyStats(LocalDate.now().minusDays(1).toString());
        projectRepository.recomputeTrendingScores();
        log.info("Trending refresh complete");
    }

    /**
     * A free-tier instance can sleep for days. Rescore once on wake so the shelf is
     * never ordered by stale data, and never let a failure here stop the app booting —
     * serving slightly stale scores beats not serving at all.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void recomputeOnStartup() {
        try {
            projectRepository.recomputeTrendingScores();
            log.info("Trending scores recomputed on startup");
        } catch (Exception ex) {
            log.warn("Startup trending recompute failed; serving existing scores", ex);
        }
    }
}
